# Manual Testing Checklist for Calculator Enhancements

This checklist covers manual testing for the calculator enhancements feature. Use this to verify the complete user flows work correctly on actual devices.

## Prerequisites
- [ ] App is running on iOS simulator/device OR Android emulator/device
- [ ] All automated tests are passing

## 1. Slider Interaction Testing

### Test in Home Screen (EMI Calculator)
- [ ] Open the EMI Calculator
- [ ] **Touch Recognition**: Tap and hold the slider thumb - it should respond immediately
- [ ] **Drag Gesture**: Drag the slider left and right - value should update smoothly in real-time
- [ ] **Tap-to-Position**: Tap anywhere on the slider track - thumb should jump to that position
- [ ] **Value Persistence**: Release the slider - value should stay at the final position without drift
- [ ] **Scroll Interference**: Try scrolling the screen while touching near the slider - slider should not interfere with scrolling when not directly touched

### Test in TVM Calculator
- [ ] Navigate to TVM Calculator
- [ ] Test slider interactions (if any sliders present)
- [ ] Verify smooth operation without lag

### Test in PPF Calculator
- [ ] Navigate to PPF Calculator
- [ ] **Duration Slider**: Test the duration slider (15-30 years)
  - [ ] Drag to minimum (15 years)
  - [ ] Drag to maximum (30 years)
  - [ ] Tap at various positions
  - [ ] Verify value updates correctly

## 2. TVM Calculator Testing

### Navigation
- [ ] From Home screen, locate "TVM Calculator" option
- [ ] Tap to navigate to TVM Calculator screen
- [ ] Verify screen loads correctly with all UI elements visible
- [ ] Tap back button to return to Home screen

### Variable Selection
- [ ] **PV Selection**: Tap "PV" button - verify 4 input fields appear (FV, PMT, N, Rate)
- [ ] **FV Selection**: Tap "FV" button - verify 4 input fields appear (PV, PMT, N, Rate)
- [ ] **PMT Selection**: Tap "PMT" button - verify 4 input fields appear (PV, FV, N, Rate)
- [ ] **N Selection**: Tap "N" button - verify 4 input fields appear (PV, FV, PMT, Rate)
- [ ] **Rate Selection**: Tap "Rate" button - verify 4 input fields appear (PV, FV, PMT, N)

### Calculate Present Value (PV)
- [ ] Select PV as variable to calculate
- [ ] Enter: FV = 100000, PMT = 0, N = 10, Rate = 8%
- [ ] Select compounding frequency: Annually
- [ ] Select payment timing: End
- [ ] Tap "Calculate"
- [ ] Verify result is displayed with ₹ symbol
- [ ] Verify result is reasonable (should be less than FV)

### Calculate Future Value (FV)
- [ ] Select FV as variable to calculate
- [ ] Enter: PV = 50000, PMT = 1000, N = 5, Rate = 7%
- [ ] Select compounding frequency: Monthly
- [ ] Select payment timing: End
- [ ] Tap "Calculate"
- [ ] Verify result is displayed with ₹ symbol
- [ ] Verify result is reasonable (should be greater than PV)

### Calculate Payment (PMT)
- [ ] Select PMT as variable to calculate
- [ ] Enter: PV = -100000, FV = 0, N = 24, Rate = 10%
- [ ] Select compounding frequency: Monthly
- [ ] Select payment timing: End
- [ ] Tap "Calculate"
- [ ] Verify result is displayed with ₹ symbol
- [ ] Verify result is reasonable (positive payment amount)

### Calculate Number of Periods (N)
- [ ] Select N as variable to calculate
- [ ] Enter: PV = -50000, FV = 0, PMT = 2000, Rate = 8%
- [ ] Select compounding frequency: Monthly
- [ ] Select payment timing: End
- [ ] Tap "Calculate"
- [ ] Verify result is displayed (in years)
- [ ] Verify result is reasonable

### Calculate Interest Rate (Rate)
- [ ] Select Rate as variable to calculate
- [ ] Enter: PV = -100000, FV = 0, PMT = 5000, N = 2
- [ ] Select compounding frequency: Monthly
- [ ] Select payment timing: End
- [ ] Tap "Calculate"
- [ ] Verify result is displayed (as percentage)
- [ ] Verify result is reasonable

### Compounding Frequency
- [ ] Test calculation with Monthly compounding
- [ ] Test calculation with Quarterly compounding
- [ ] Test calculation with Semi-Annually compounding
- [ ] Test calculation with Annually compounding
- [ ] Verify results differ appropriately

### Payment Timing
- [ ] Calculate with "End of Period" timing
- [ ] Calculate with "Beginning of Period" timing
- [ ] Verify results differ slightly (beginning should be slightly less)

### Reset Functionality
- [ ] Enter values in all fields
- [ ] Tap "Reset" button
- [ ] Verify all fields are cleared
- [ ] Verify default selections are restored

### Error Handling
- [ ] Try to calculate with missing fields - verify error message
- [ ] Try to calculate with invalid values (e.g., negative rate) - verify error handling
- [ ] Try to calculate with zero values - verify appropriate handling

## 3. PPF Calculator Testing

### Navigation
- [ ] From Home screen, locate "PPF Calculator" option
- [ ] Tap to navigate to PPF Calculator screen
- [ ] Verify screen loads correctly with all UI elements visible
- [ ] Tap back button to return to Home screen

### Input Validation
- [ ] **Deposit Amount**:
  - [ ] Enter 500 (minimum) - should be accepted
  - [ ] Enter 150000 (maximum) - should be accepted
  - [ ] Try to enter 400 (below minimum) - verify validation error
  - [ ] Try to enter 200000 (above maximum) - verify validation error

- [ ] **Interest Rate**:
  - [ ] Enter 7.1% - should be accepted
  - [ ] Enter 50% (maximum) - should be accepted
  - [ ] Try to enter 51% (above maximum) - verify validation error

- [ ] **Duration Slider**:
  - [ ] Drag to 15 years (minimum) - verify accepted
  - [ ] Drag to 30 years (maximum) - verify accepted
  - [ ] Verify cannot go below 15 or above 30

### Date Picker
- [ ] Tap on investment date field
- [ ] Select a date
- [ ] Verify date is displayed in DD MMM YYYY format (e.g., "15 Nov 2024")

### Calculate PPF
- [ ] Enter: Deposit = 50000, Rate = 7.1%, Duration = 15 years
- [ ] Tap "Calculate"
- [ ] Verify results are displayed:
  - [ ] Total Investment (should be ₹7,50,000)
  - [ ] Interest Earned (should be positive)
  - [ ] Maturity Amount (should be Total + Interest)
- [ ] Verify all amounts have ₹ symbol
- [ ] Verify Indian number formatting (e.g., ₹7,50,000)

### Test Different Scenarios
- [ ] **Minimum Deposit**: 500 × 15 years
- [ ] **Maximum Deposit**: 150000 × 30 years
- [ ] **Different Rates**: Try 6%, 7.1%, 8%, 10%
- [ ] **Different Durations**: Try 15, 20, 25, 30 years

### Reset Functionality
- [ ] Enter values in all fields
- [ ] Tap "Reset" button
- [ ] Verify all fields are cleared
- [ ] Verify slider returns to default position
- [ ] Verify date returns to default

### Error Handling
- [ ] Try to calculate with missing deposit amount - verify error
- [ ] Try to calculate with missing interest rate - verify error
- [ ] Try to calculate with invalid values - verify error handling

## 4. Currency Formatting Verification

### Across All Calculators
- [ ] **EMI Calculator**: Verify results show ₹ symbol
- [ ] **TVM Calculator**: Verify all monetary results show ₹ symbol
- [ ] **PPF Calculator**: Verify all three result fields show ₹ symbol
- [ ] **FD Calculator**: Verify results show ₹ symbol
- [ ] **SIP Calculator**: Verify results show ₹ symbol
- [ ] **RD Calculator**: Verify results show ₹ symbol
- [ ] **GST Calculator**: Verify results show ₹ symbol

### Indian Number Formatting
- [ ] Verify amounts use Indian comma placement:
  - [ ] ₹1,000 (one thousand)
  - [ ] ₹10,000 (ten thousand)
  - [ ] ₹1,00,000 (one lakh)
  - [ ] ₹10,00,000 (ten lakhs)
  - [ ] ₹1,00,00,000 (one crore)

### Decimal Precision
- [ ] Verify all amounts show 2 decimal places
- [ ] Verify rounding is correct

## 5. Navigation Flow Testing

### Complete Navigation Path
- [ ] Home → TVM Calculator → Back to Home
- [ ] Home → PPF Calculator → Back to Home
- [ ] Home → EMI Calculator → Back to Home
- [ ] Home → TVM Calculator → Home → PPF Calculator → Back to Home

### Navigation Consistency
- [ ] Verify back button works on all calculator screens
- [ ] Verify navigation animations are smooth
- [ ] Verify no navigation errors or crashes

## 6. Cross-Platform Testing (if possible)

### iOS Testing
- [ ] Test all above scenarios on iOS simulator
- [ ] Test on physical iOS device (if available)
- [ ] Verify slider touch responsiveness on iOS
- [ ] Verify keyboard behavior on iOS
- [ ] Verify date picker on iOS

### Android Testing
- [ ] Test all above scenarios on Android emulator
- [ ] Test on physical Android device (if available)
- [ ] Verify slider touch responsiveness on Android
- [ ] Verify keyboard behavior on Android
- [ ] Verify date picker on Android

### Platform-Specific Issues
- [ ] Note any differences in behavior between platforms
- [ ] Verify both platforms handle edge cases correctly
- [ ] Verify UI looks correct on both platforms

## 7. Performance Testing

### Responsiveness
- [ ] Verify slider responds without lag
- [ ] Verify calculations complete quickly (< 1 second)
- [ ] Verify screen transitions are smooth
- [ ] Verify no freezing or stuttering

### Memory
- [ ] Navigate between screens multiple times - verify no memory leaks
- [ ] Perform calculations multiple times - verify no performance degradation

## 8. Edge Cases and Stress Testing

### Extreme Values
- [ ] Test with very large numbers (e.g., 10 crores)
- [ ] Test with very small numbers (e.g., ₹500)
- [ ] Test with maximum duration (30 years)
- [ ] Test with maximum interest rate (50%)

### Rapid Input
- [ ] Rapidly tap buttons - verify no crashes
- [ ] Rapidly drag sliders - verify smooth operation
- [ ] Rapidly switch between calculators - verify stability

### Interruptions
- [ ] Receive a phone call during calculation - verify app recovers
- [ ] Switch to another app and back - verify state is preserved
- [ ] Lock and unlock device - verify state is preserved

## Test Results Summary

**Date Tested**: _______________
**Tester Name**: _______________
**Platform**: iOS / Android (circle one)
**Device**: _______________

**Overall Result**: PASS / FAIL (circle one)

**Issues Found**:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**Notes**:
_______________________________________________
_______________________________________________
_______________________________________________
