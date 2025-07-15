// Calculator logic
let calculation = null;

function formatCurrency(number) {
    return new Intl.NumberFormat('ru-RU').format(number);
}

function parseCurrency(value) {
    return parseInt(value.replace(/\s/g, '')) || 0;
}

function formatInputField(value) {
    const parsed = parseCurrency(value);
    return parsed > 0 ? formatCurrency(parsed) : "";
}

function calculateMonthsUntilAugust2027() {
    const currentDate = new Date();
    const endDate = new Date(2027, 7, 31); // August 31, 2027
    const yearDiff = endDate.getFullYear() - currentDate.getFullYear();
    const monthDiff = endDate.getMonth() - currentDate.getMonth();
    return yearDiff * 12 + monthDiff;
}

function calculateInstallment() {
    const apartmentCostInput = document.getElementById('apartmentCost');
    const downPaymentInput = document.getElementById('downPayment');
    const discountPercentageInput = document.getElementById('discountPercentage');

    const apartmentCostNum = parseCurrency(apartmentCostInput.value);
    const downPaymentNum = parseCurrency(downPaymentInput.value);
    const discountPercent = parseFloat(discountPercentageInput.value) || 0;

    if (!apartmentCostNum || !downPaymentNum) {
        hideResults();
        return;
    }

    // Calculate discount amount from percentage
    const discountNum = apartmentCostNum * (discountPercent / 100);
    const discountedPrice = apartmentCostNum - discountNum;
    
    // Validate minimum down payment (30%)
    const minDownPayment = discountedPrice * 0.3;
    
    if (downPaymentNum < minDownPayment) {
        showError(`Минимальный первый взнос: ${formatCurrency(minDownPayment)} ₽`);
        hideResults();
        return;
    } else {
        hideError();
    }

    const downPaymentPercentage = (downPaymentNum / discountedPrice) * 100;
    
    // Calculate months until August 2027
    const installmentPeriod = calculateMonthsUntilAugust2027();
    const endDate = new Date(2027, 7, 31).toLocaleDateString('ru-RU', { 
        year: 'numeric', 
        month: 'long' 
    });
    
    // Determine interest rate
    const interestRate = downPaymentPercentage > 50 ? 0 : 10;
    const remainingAmount = discountedPrice - downPaymentNum;
    
    // Calculate interest using annuity formula like mortgage calculator
    const monthlyRate = interestRate / 100 / 12;
    let interestAmount = 0;
    
    if (interestRate > 0 && installmentPeriod > 0) {
        const factor = Math.pow(1 + monthlyRate, installmentPeriod);
        const annuityPayment = remainingAmount * (monthlyRate * factor) / (factor - 1);
        const totalAnnuityPayments = annuityPayment * installmentPeriod;
        interestAmount = totalAnnuityPayments - remainingAmount;
    }
    
    // Calculate payment schedule
    const monthlyPayment = 50000;
    const installmentPayments = monthlyPayment * installmentPeriod;
    
    // Total amount to pay through installments (remaining + interest)
    const totalInstallmentAmount = remainingAmount + interestAmount;
    
    // Amount that will remain after monthly payments
    const remainingAfterInstallments = Math.max(0, totalInstallmentAmount - installmentPayments);
    
    // Total cost calculation
    const totalCost = Math.round(downPaymentNum + installmentPayments + remainingAfterInstallments);

    calculation = {
        apartmentCost: apartmentCostNum,
        discount: discountNum,
        discountPercentage: discountPercent,
        discountedPrice,
        downPayment: downPaymentNum,
        downPaymentPercentage,
        interestRate,
        remainingAmount,
        interestAmount,
        totalCost,
        monthlyPayment,
        numberOfPayments: installmentPeriod,
        totalPayments: installmentPayments,
        remainingAfterInstallments,
        endDate
    };

    updateResults();
}

function showError(message) {
    const errorDiv = document.getElementById('validationError');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    document.getElementById('validationError').classList.add('hidden');
}

function hideResults() {
    calculation = null;
    updateResults();
}

function updateResults() {
    updateInstallmentPeriod();
    updateInterestRate();
    updateCalculationBreakdown();
    updatePaymentSchedule();
}

function updateInstallmentPeriod() {
    const periodElement = document.getElementById('installmentPeriod');
    const endDateElement = document.getElementById('installmentEndDate');
    
    if (calculation) {
        periodElement.textContent = `${calculation.numberOfPayments} месяцев`;
        endDateElement.textContent = `До ${calculation.endDate}`;
    } else {
        periodElement.textContent = 'Рассчитывается автоматически';
        endDateElement.textContent = 'До августа 2027 года';
    }
}

function updateInterestRate() {
    const rateElement = document.getElementById('interestRate');
    const descriptionElement = document.getElementById('interestRateDescription');
    
    if (calculation) {
        rateElement.textContent = `${calculation.interestRate}%`;
        descriptionElement.textContent = calculation.interestRate === 0 
            ? 'Первый взнос больше 50% от стоимости'
            : 'Первый взнос меньше 50% от стоимости';
    } else {
        rateElement.textContent = '0%';
        descriptionElement.textContent = 'Первый взнос меньше 50% от стоимости';
    }
}

function updateCalculationBreakdown() {
    const detailsElement = document.getElementById('calculationDetails');
    
    if (!calculation) {
        detailsElement.innerHTML = '<p class="text-gray-500">Введите данные для расчета</p>';
        return;
    }

    let html = `
        <div class="space-y-3">
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-gray-600">Стоимость квартиры:</span>
                <span class="font-medium">${formatCurrency(calculation.apartmentCost)} ₽</span>
            </div>
    `;

    if (calculation.discountPercentage > 0) {
        html += `
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-gray-600">Скидка (${calculation.discountPercentage}%):</span>
                <span class="font-medium text-green-600">- ${formatCurrency(calculation.discount)} ₽</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-gray-600">Стоимость с учетом скидки:</span>
                <span class="font-medium">${formatCurrency(calculation.discountedPrice)} ₽</span>
            </div>
        `;
    }

    html += `
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-gray-600">Первый взнос:</span>
                <span class="font-medium">${formatCurrency(calculation.downPayment)} ₽</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-gray-600">Размер первого взноса:</span>
                <span class="font-medium">${calculation.downPaymentPercentage.toFixed(1)}%</span>
            </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <div class="flex justify-between items-center">
                <span class="text-gray-600">Остаток к доплате:</span>
                <span class="font-medium">${formatCurrency(calculation.remainingAmount)} ₽</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-600">Проценты за ${calculation.numberOfPayments} месяцев:</span>
                <span class="font-medium">${formatCurrency(Math.round(calculation.interestAmount))} ₽</span>
            </div>
            <div class="flex justify-between items-center text-lg font-semibold pt-2 border-t border-gray-200">
                <span class="text-gray-900">Итоговая стоимость:</span>
                <span class="text-blue-600">${formatCurrency(Math.round(calculation.totalCost))} ₽</span>
            </div>
        </div>
    `;

    detailsElement.innerHTML = html;
}

function updatePaymentSchedule() {
    const scheduleElement = document.getElementById('scheduleDetails');
    
    if (!calculation) {
        scheduleElement.innerHTML = '<p class="text-gray-500">Введите данные для расчета</p>';
        return;
    }

    const html = `
        <!-- Payment Schedule Grid -->
        <div class="grid grid-rows-3 grid-cols-1 gap-4 md:grid-rows-3 md:grid-cols-1">
            <!-- Down Payment Column -->
            <div class="bg-blue-50 rounded-lg p-6 min-w-[180px] text-center">
                <h4 class="text-sm font-medium text-gray-700 mb-2">Первый взнос</h4>
                <div class="text-lg font-bold text-blue-600 break-words">
                    ${formatCurrency(calculation.downPayment)} ₽
                </div>
                <div class="text-xs text-gray-600 mt-1">
                    ${calculation.downPaymentPercentage.toFixed(1)}% от стоимости
                </div>
            </div>

            <!-- Installment Payments Column -->
            <div class="bg-green-50 rounded-lg p-6 min-w-[180px] text-center">
                <h4 class="text-sm font-medium text-gray-700 mb-2">Выплата в рассрочку</h4>
                <div class="text-lg font-bold text-green-600 break-words">
                    ${formatCurrency(calculation.totalPayments)} ₽
                </div>
                <div class="text-xs text-gray-600 mt-1">
                    ${calculation.numberOfPayments} платежей по ${formatCurrency(calculation.monthlyPayment)} ₽
                </div>
            </div>

            <!-- Remaining Amount Column -->
            <div class="bg-orange-50 rounded-lg p-6 min-w-[180px] text-center">
                <h4 class="text-sm font-medium text-gray-700 mb-2">Останется выплатить</h4>
                <div class="text-lg font-bold text-orange-600 break-words">
                    ${formatCurrency(Math.round(calculation.remainingAfterInstallments))} ₽
                </div>
                <div class="text-xs text-gray-600 mt-1">
                    или перевести в ипотеку
                </div>
            </div>
        </div>

        <!-- Summary -->
        <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex justify-between items-center text-sm text-gray-600 mb-2">
                <span>Итоговая переплата по рассрочке:</span>
                <span class="font-medium">${formatCurrency(Math.round(calculation.interestAmount))} ₽</span>
            </div>
            <div class="flex justify-between items-center text-lg font-semibold pt-2 border-t border-gray-200">
                <span class="text-gray-900">Итоговая стоимость:</span>
                <span class="text-blue-600">${formatCurrency(Math.round(calculation.totalCost))} ₽</span>
            </div>
        </div>
    `;

    scheduleElement.innerHTML = html;
}

function handleInputChange(input, setter) {
    const formatted = formatInputField(input.value);
    input.value = formatted;
    calculateInstallment();
}

function handlePercentageChange(input) {
    // Allow only numbers and decimal point
    const cleaned = input.value.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
        return; // Prevent multiple decimal points
    }
    input.value = cleaned;
    calculateInstallment();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const apartmentCostInput = document.getElementById('apartmentCost');
    const downPaymentInput = document.getElementById('downPayment');
    const discountPercentageInput = document.getElementById('discountPercentage');

    apartmentCostInput.addEventListener('input', function() {
        handleInputChange(this);
    });

    downPaymentInput.addEventListener('input', function() {
        handleInputChange(this);
    });

    discountPercentageInput.addEventListener('input', function() {
        handlePercentageChange(this);
    });

    // Initial calculation
    calculateInstallment();
}); 