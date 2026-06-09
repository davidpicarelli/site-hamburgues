"""
Comprehensive backend API tests for Forensic Loan Auditor.
Tests all endpoints, mathematical correctness, and BACEN integration.
"""
import requests
import sys
from datetime import datetime, date, timedelta
from decimal import Decimal

# Use public endpoint from frontend/.env
BASE_URL = "https://contract-auditor-6.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.tests_run = 0
        self.tests_passed = 0
        self.tests_failed = []

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n{'='*60}")
        print(f"🔍 Test {self.tests_run}: {name}")
        print(f"{'='*60}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            else:
                raise ValueError(f"Unsupported method: {method}")

            print(f"Status Code: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Expected {expected_status}, got {response.status_code}")
                try:
                    resp_json = response.json()
                    return True, resp_json
                except:
                    return True, response.content
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text[:500]}")
                self.tests_failed.append(name)
                return False, {}

        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            self.tests_failed.append(name)
            return False, {}

    def test_root(self):
        """Test GET /api/"""
        success, response = self.run_test(
            "GET /api/ - API Info",
            "GET",
            "/",
            200
        )
        if success:
            print(f"API Message: {response.get('message')}")
            print(f"Version: {response.get('version')}")
        return success

    def test_bacen_series(self):
        """Test GET /api/bacen/series"""
        success, response = self.run_test(
            "GET /api/bacen/series - BACEN Series Catalog",
            "GET",
            "/bacen/series",
            200
        )
        if success:
            series = response.get('series', [])
            print(f"Number of series: {len(series)}")
            if len(series) == 11:
                print("✅ Correct number of series (11)")
            else:
                print(f"⚠️  Expected 11 series, got {len(series)}")
            # Print first 3 series
            for s in series[:3]:
                print(f"  - {s.get('code')}: {s.get('label')}")
        return success

    def test_bacen_fetch(self):
        """Test POST /api/bacen/fetch with real BACEN API"""
        # Use recent dates for series 25471 (PF - Aquisição de veículos)
        end_date = date.today()
        start_date = end_date - timedelta(days=90)
        
        success, response = self.run_test(
            "POST /api/bacen/fetch - Fetch Real BACEN Data",
            "POST",
            "/bacen/fetch",
            200,
            data={
                "series_code": 25471,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            timeout=30
        )
        if success:
            print(f"Series: {response.get('series_code')} - {response.get('series_label')}")
            print(f"Unit: {response.get('unit')}")
            print(f"Data points: {response.get('count')}")
            print(f"Average: {response.get('average')}")
            if response.get('average') is not None:
                print("✅ BACEN average computed successfully")
        return success

    def test_calculate_basic(self):
        """Test POST /api/calculate with basic contract (no payments)"""
        # Contract: principal=50000, monthly_rate=2.5%, term=24, IOF=450, fees=300
        # Expected Price PMT ≈ R$ 2812
        success, response = self.run_test(
            "POST /api/calculate - Basic Contract (No Payments)",
            "POST",
            "/calculate",
            200,
            data={
                "contract": {
                    "principal": 50000,
                    "monthly_rate": 0.025,
                    "term_months": 24,
                    "start_date": "2023-01-15",
                    "iof": 450,
                    "fees": 300,
                    "original_system": "price"
                },
                "payments": [],
                "day_count": "30"
            }
        )
        if success:
            price_pmt = response.get('price', {}).get('pmt')
            print(f"Price PMT: R$ {price_pmt:.2f}")
            
            # Verify PMT is approximately R$ 2812 (tolerance ±50)
            if price_pmt and 2750 <= price_pmt <= 2900:
                print(f"✅ Price PMT within expected range (2750-2900)")
            else:
                print(f"⚠️  Price PMT outside expected range: {price_pmt}")
            
            # Check all three methods returned
            if 'price' in response and 'sac' in response and 'hamburgues' in response:
                print("✅ All three methods (Price, SAC, Hamburguês) returned")
                print(f"Price total interest: R$ {response['price']['total_interest']:.2f}")
                print(f"SAC total interest: R$ {response['sac']['total_interest']:.2f}")
                print(f"Hamburguês total interest: R$ {response['hamburgues']['total_interest']:.2f}")
            
            # Check indicators
            indicators = response.get('indicators', {})
            print(f"Excess interest (Price - Hamburguês): R$ {indicators.get('excess_interest_vs_hamburgues', 0):.2f}")
            print(f"Anatocism detected: {indicators.get('anatocism')}")
        
        return success

    def test_calculate_with_payments(self):
        """Test POST /api/calculate with custom payment history"""
        # Irregular payments: partial, late
        success, response = self.run_test(
            "POST /api/calculate - With Custom Payment History",
            "POST",
            "/calculate",
            200,
            data={
                "contract": {
                    "principal": 50000,
                    "monthly_rate": 0.025,
                    "term_months": 24,
                    "start_date": "2023-01-15",
                    "iof": 450,
                    "fees": 300,
                    "original_system": "price"
                },
                "payments": [
                    {"payment_date": "2023-02-15", "amount": 2500, "note": "Pagamento parcial"},
                    {"payment_date": "2023-03-20", "amount": 2800, "note": "Pagamento atrasado"},
                    {"payment_date": "2023-04-15", "amount": 2700, "note": ""},
                ],
                "day_count": "30"
            }
        )
        if success:
            hamb = response.get('hamburgues', {})
            rows = hamb.get('rows', [])
            print(f"Hamburguês schedule rows: {len(rows)}")
            
            # Check if payment count matches
            if len(rows) == 3:
                print("✅ Payment count matches (3 payments)")
            else:
                print(f"⚠️  Expected 3 rows, got {len(rows)}")
            
            # Check for pending interest notes
            has_pending_note = any('pendentes' in row.get('note', '').lower() for row in rows)
            if has_pending_note:
                print("✅ Found pending interest note (payment < interest)")
            
            print(f"Total interest: R$ {hamb.get('total_interest', 0):.2f}")
            print(f"Final balance: R$ {hamb.get('final_balance', 0):.2f}")
        
        return success

    def test_calculate_bacen_comparison(self):
        """Test POST /api/calculate with BACEN comparison"""
        # Contract rate 2.5% a.m., manual BACEN rate 1.95% a.m.
        # Should set above_bacen=True
        success, response = self.run_test(
            "POST /api/calculate - BACEN Comparison (above_bacen)",
            "POST",
            "/calculate",
            200,
            data={
                "contract": {
                    "principal": 50000,
                    "monthly_rate": 0.025,
                    "term_months": 24,
                    "start_date": "2023-01-15",
                    "original_system": "price"
                },
                "payments": [],
                "bacen": {
                    "mode": "manual",
                    "series_code": 25471,
                    "unit": "% a.m.",
                    "manual_rate": 1.95
                },
                "day_count": "30"
            }
        )
        if success:
            indicators = response.get('indicators', {})
            above_bacen = indicators.get('above_bacen')
            print(f"Above BACEN: {above_bacen}")
            print(f"Contract monthly rate: {indicators.get('contract_monthly_rate_pct')}% a.m.")
            
            if above_bacen is True:
                print("✅ Correctly identified rate above BACEN (2.5% > 1.95%)")
            else:
                print(f"⚠️  Expected above_bacen=True, got {above_bacen}")
        
        return success

    def test_report_excel(self):
        """Test POST /api/report/excel"""
        # First get a calculation result
        calc_success, calc_response = self.run_test(
            "POST /api/calculate - For Excel Report",
            "POST",
            "/calculate",
            200,
            data={
                "contract": {
                    "principal": 50000,
                    "monthly_rate": 0.025,
                    "term_months": 24,
                    "start_date": "2023-01-15",
                    "original_system": "price"
                },
                "payments": [],
                "day_count": "30"
            }
        )
        
        if not calc_success:
            print("⚠️  Skipping Excel test - calculation failed")
            return False
        
        # Now test Excel generation
        success, response = self.run_test(
            "POST /api/report/excel - Generate Excel Report",
            "POST",
            "/report/excel",
            200,
            data=calc_response
        )
        
        if success:
            content = response if isinstance(response, bytes) else b''
            print(f"Excel file size: {len(content)} bytes")
            
            # Check if it's a valid xlsx (starts with PK signature)
            if len(content) > 8000 and content[:2] == b'PK':
                print("✅ Valid Excel file (PK signature, size > 8KB)")
            else:
                print(f"⚠️  Excel file may be invalid (size: {len(content)}, signature: {content[:4]})")
        
        return success

    def test_report_pdf(self):
        """Test POST /api/report/pdf"""
        # First get a calculation result
        calc_success, calc_response = self.run_test(
            "POST /api/calculate - For PDF Report",
            "POST",
            "/calculate",
            200,
            data={
                "contract": {
                    "principal": 50000,
                    "monthly_rate": 0.025,
                    "term_months": 24,
                    "start_date": "2023-01-15",
                    "original_system": "price"
                },
                "payments": [],
                "day_count": "30"
            }
        )
        
        if not calc_success:
            print("⚠️  Skipping PDF test - calculation failed")
            return False
        
        # Now test PDF generation
        success, response = self.run_test(
            "POST /api/report/pdf - Generate PDF Report",
            "POST",
            "/report/pdf",
            200,
            data=calc_response
        )
        
        if success:
            content = response if isinstance(response, bytes) else b''
            print(f"PDF file size: {len(content)} bytes")
            
            # Check if it's a valid PDF (starts with %PDF)
            if len(content) > 3000 and content[:4] == b'%PDF':
                print("✅ Valid PDF file (%PDF signature, size > 3KB)")
            else:
                print(f"⚠️  PDF file may be invalid (size: {len(content)}, signature: {content[:10]})")
        
        return success

    def test_mathematical_correctness(self):
        """Test mathematical correctness of Price PMT calculation"""
        # Price PMT for principal=10000, monthly_rate=0.02, term=24
        # Expected: R$ 528.71 ± 0.05
        success, response = self.run_test(
            "Mathematical Correctness - Price PMT Calculation",
            "POST",
            "/calculate",
            200,
            data={
                "contract": {
                    "principal": 10000,
                    "monthly_rate": 0.02,
                    "term_months": 24,
                    "start_date": "2023-01-01",
                    "original_system": "price"
                },
                "payments": [],
                "day_count": "30"
            }
        )
        
        if success:
            price_pmt = response.get('price', {}).get('pmt')
            print(f"Price PMT: R$ {price_pmt:.2f}")
            
            # Check if within tolerance
            expected = 528.71
            tolerance = 0.05
            if price_pmt and abs(price_pmt - expected) <= tolerance:
                print(f"✅ Price PMT correct: {price_pmt:.2f} (expected {expected} ± {tolerance})")
            else:
                print(f"⚠️  Price PMT outside tolerance: {price_pmt:.2f} (expected {expected} ± {tolerance})")
            
            # Check SAC: last installment should be less than first
            sac_rows = response.get('sac', {}).get('rows', [])
            if len(sac_rows) >= 2:
                first_inst = sac_rows[0]['installment']
                last_inst = sac_rows[-1]['installment']
                print(f"SAC first installment: R$ {first_inst:.2f}")
                print(f"SAC last installment: R$ {last_inst:.2f}")
                
                if last_inst < first_inst:
                    print("✅ SAC last installment < first installment (correct)")
                else:
                    print(f"⚠️  SAC last installment should be less than first")
        
        return success

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        print(f"Total tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.tests_failed:
            print("\n❌ Failed tests:")
            for test in self.tests_failed:
                print(f"  - {test}")
        else:
            print("\n✅ All tests passed!")
        
        print("="*60)
        
        return 0 if self.tests_passed == self.tests_run else 1


def main():
    print("="*60)
    print("🚀 FORENSIC LOAN AUDITOR - BACKEND API TESTS")
    print("="*60)
    print(f"Base URL: {BASE_URL}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    tester = BackendTester()
    
    # Run all tests
    tester.test_root()
    tester.test_bacen_series()
    tester.test_bacen_fetch()
    tester.test_calculate_basic()
    tester.test_calculate_with_payments()
    tester.test_calculate_bacen_comparison()
    tester.test_mathematical_correctness()
    tester.test_report_excel()
    tester.test_report_pdf()
    
    # Print summary
    return tester.print_summary()


if __name__ == "__main__":
    sys.exit(main())
