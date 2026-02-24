/**
 * Tax Engine Test
 * 
 * These are manual verification tests to compare with CRA PDOC results.
 * Run with: npx ts-node utils/taxEngine.test.ts
 */

import { calculateFromAnnualSalary } from './taxEngine';
import { PayFrequency, Province } from '../types';

interface TestCase {
  name: string;
  annualSalary: number;
  province: string;
  expectedRange: {
    federalTax: [number, number];
    provincialTax: [number, number];
    cpp: [number, number];
    ei: [number, number];
    netPay: [number, number];
  };
}

const testCases: TestCase[] = [
  {
    name: 'Ontario $60,000',
    annualSalary: 60000,
    province: Province.ON,
    expectedRange: {
      federalTax: [5000, 6000], // Approximate bi-weekly range
      provincialTax: [2500, 3500],
      cpp: [240, 260],
      ei: [80, 90],
      netPay: [1650, 1850]
    }
  },
  {
    name: 'Ontario $85,000 (CPP2 applies)',
    annualSalary: 85000,
    province: Province.ON,
    expectedRange: {
      federalTax: [7500, 9000],
      provincialTax: [4500, 5500],
      cpp: [240, 280], // Higher due to CPP2
      ei: [80, 90],
      netPay: [2200, 2500]
    }
  },
  {
    name: 'BC $75,000',
    annualSalary: 75000,
    province: Province.BC,
    expectedRange: {
      federalTax: [6500, 7800],
      provincialTax: [3500, 4200],
      cpp: [240, 260],
      ei: [80, 90],
      netPay: [1900, 2200]
    }
  },
  {
    name: 'Alberta $100,000',
    annualSalary: 100000,
    province: Province.AB,
    expectedRange: {
      federalTax: [9500, 11500],
      provincialTax: [5500, 6500],
      cpp: [240, 280],
      ei: [80, 90],
      netPay: [2600, 3000]
    }
  }
];

function runTests() {
  console.log('=== CanPay Tax Engine Verification Tests ===\n');
  
  let passCount = 0;
  let failCount = 0;
  
  for (const test of testCases) {
    console.log(`\n📊 Test: ${test.name}`);
    console.log(`   Annual Salary: $${test.annualSalary.toLocaleString()}`);
    
    try {
      const result = calculateFromAnnualSalary({
        annualSalary: test.annualSalary,
        province: test.province,
        payFrequency: PayFrequency.BI_WEEKLY
      });
      
      const biWeeklyFederalTax = result.federalTax;
      const biWeeklyProvincialTax = result.provincialTax;
      const biWeeklyCPP = result.cppDeduction;
      const biWeeklyEI = result.eiDeduction;
      const biWeeklyNetPay = result.netPayBiWeekly;
      
      console.log(`   Results (Bi-weekly):`);
      console.log(`     Federal Tax:    $${biWeeklyFederalTax.toFixed(2)}`);
      console.log(`     Provincial Tax: $${biWeeklyProvincialTax.toFixed(2)}`);
      console.log(`     CPP:            $${biWeeklyCPP.toFixed(2)}`);
      console.log(`     EI:             $${biWeeklyEI.toFixed(2)}`);
      console.log(`     Net Pay:        $${biWeeklyNetPay.toFixed(2)}`);
      
      // Check if within expected ranges
      const federalPass = biWeeklyFederalTax * 26 >= test.expectedRange.federalTax[0] && 
                          biWeeklyFederalTax * 26 <= test.expectedRange.federalTax[1];
      const provincialPass = biWeeklyProvincialTax * 26 >= test.expectedRange.provincialTax[0] && 
                             biWeeklyProvincialTax * 26 <= test.expectedRange.provincialTax[1];
      const cppPass = biWeeklyCPP >= test.expectedRange.cpp[0] && biWeeklyCPP <= test.expectedRange.cpp[1];
      const eiPass = biWeeklyEI >= test.expectedRange.ei[0] && biWeeklyEI <= test.expectedRange.ei[1];
      
      if (federalPass && provincialPass && cppPass && eiPass) {
        console.log(`   ✅ PASS`);
        passCount++;
      } else {
        console.log(`   ⚠️  WARNING: Values outside typical range`);
        if (!federalPass) console.log(`      - Federal tax annual: $${(biWeeklyFederalTax * 26).toFixed(0)}`);
        if (!provincialPass) console.log(`      - Provincial tax annual: $${(biWeeklyProvincialTax * 26).toFixed(0)}`);
        failCount++;
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error}`);
      failCount++;
    }
  }
  
  console.log(`\n=== Test Summary ===`);
  console.log(`Passed: ${passCount}`);
  console.log(`Warnings: ${failCount}`);
  console.log(`\n💡 Note: These are sanity checks. For accurate verification,`);
  console.log(`   compare results with CRA PDOC: https://www.canada.ca/en/revenue-agency/services/e-services/digital-services-businesses/payroll-deductions-online-calculator.html`);
}

// Run if executed directly
if (require.main === module) {
  runTests();
}

export { runTests };
