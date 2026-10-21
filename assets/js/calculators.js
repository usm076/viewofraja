// Calculator behaviour for the loan, savings, credit-card-rewards and
// crypto-tax shortcodes. The formulas, card data and validation rules are
// carried over unchanged from the original shortcodes; only the presentation
// changed (formatted figures, inline errors instead of alert()).

const money = (n, digits = 2) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const num = (form, name) => parseFloat(form.elements[name].value);

function show(form, values) {
  const out = form.closest('.calculator').querySelector('[data-results]');
  Object.entries(values).forEach(([key, value]) => {
    const el = out.querySelector(`[data-out="${key}"]`);
    if (el) el.textContent = value;
  });
  out.hidden = false;
}

function fail(form, message) {
  const err = form.querySelector('[data-error]');
  err.textContent = message;
  return false;
}

const calculators = {
  loan(form) {
    const principal = num(form, 'loanAmount');
    const annualRate = num(form, 'interestRate');
    const years = num(form, 'loanTerm');
    if (!principal || !annualRate || !years) return fail(form, 'Please fill in all fields.');

    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    const totalAmount = emi * numPayments;
    const totalInterest = totalAmount - principal;

    show(form, {
      monthlyEMI: money(emi),
      totalAmount: money(totalAmount),
      totalInterest: money(totalInterest),
      principalAmount: money(principal),
    });
    return true;
  },

  savings(form) {
    const initial = num(form, 'initialAmount') || 0;
    const monthly = num(form, 'monthlyContribution') || 0;
    const annualRate = num(form, 'annualReturn') || 0;
    const years = num(form, 'timeHorizon');
    if (!years || annualRate < 0) return fail(form, 'Please enter valid values.');

    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;
    // Future value of the initial investment
    const futureValueInitial = initial * Math.pow(1 + monthlyRate, months);
    // Future value of monthly contributions (annuity)
    let futureValueContributions = 0;
    if (monthly > 0 && monthlyRate > 0) {
      futureValueContributions = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    } else if (monthly > 0) {
      futureValueContributions = monthly * months;
    }
    const finalBalance = futureValueInitial + futureValueContributions;
    const totalContributions = initial + (monthly * months);
    const investmentGains = finalBalance - totalContributions;
    const monthlyIncome = (finalBalance * 0.04) / 12; // 4% withdrawal rule

    show(form, {
      finalBalance: money(finalBalance, 0),
      totalContributions: money(totalContributions, 0),
      investmentGains: money(investmentGains, 0),
      monthlyIncome: money(monthlyIncome, 0),
    });
    return true;
  },

  rewards(form) {
    const dining = num(form, 'diningSpend') || 0;
    const travel = num(form, 'travelSpend') || 0;
    const grocery = num(form, 'grocerySpend') || 0;
    const gas = num(form, 'gasSpend') || 0;
    const other = num(form, 'otherSpend') || 0;
    const annualSpending = {
      dining: dining * 12,
      travel: travel * 12,
      grocery: grocery * 12,
      gas: gas * 12,
      other: other * 12,
    };

    // Reward structures as published in the original calculator.
    const cards = [
      { name: 'Chase Sapphire Preferred', annualFee: 95, rewards: { dining: 0.02, travel: 0.02, grocery: 0.01, gas: 0.01, other: 0.01 } },
      { name: 'Capital One Venture X', annualFee: 395, rewards: { dining: 0.02, travel: 0.05, grocery: 0.02, gas: 0.02, other: 0.02 }, credit: 300 },
      { name: 'Citi Double Cash', annualFee: 0, rewards: { dining: 0.02, travel: 0.02, grocery: 0.02, gas: 0.02, other: 0.02 } },
      { name: 'Chase Freedom Unlimited', annualFee: 0, rewards: { dining: 0.03, travel: 0.015, grocery: 0.015, gas: 0.015, other: 0.015 } },
    ];

    const results = cards.map((card) => {
      const rewards =
        (annualSpending.dining * card.rewards.dining) +
        (annualSpending.travel * card.rewards.travel) +
        (annualSpending.grocery * card.rewards.grocery) +
        (annualSpending.gas * card.rewards.gas) +
        (annualSpending.other * card.rewards.other);
      const credit = card.credit || 0;
      return { name: card.name, rewards, annualFee: card.annualFee, credit, netValue: rewards + credit - card.annualFee };
    }).sort((a, b) => b.netValue - a.netValue);

    const list = form.closest('.calculator').querySelector('[data-out="cards"]');
    list.innerHTML = results.map((c, i) => `
      <li>
        <span class="card-compare__name">${c.name}${i === 0 ? ' <span class="card-compare__badge">Highest net value</span>' : ''}</span>
        <dl>
          <div><dt>Rewards</dt><dd>${money(c.rewards, 0)}</dd></div>
          <div><dt>Annual fee</dt><dd>${money(c.annualFee, 0)}</dd></div>
          <div><dt>Credits</dt><dd>${money(c.credit, 0)}</dd></div>
          <div><dt>Net value</dt><dd class="${c.netValue >= 0 ? 'is-positive' : 'is-negative'}">${c.netValue < 0 ? '−' : ''}${money(Math.abs(c.netValue), 0)}</dd></div>
        </dl>
      </li>`).join('');
    show(form, {});
    return true;
  },

  crypto(form) {
    const purchasePrice = num(form, 'purchasePrice');
    const salePrice = num(form, 'salePrice');
    const holdingPeriod = form.elements.holdingPeriod.value;
    const taxBracket = parseFloat(form.elements.taxBracket.value);
    if (!purchasePrice || !salePrice) return fail(form, 'Please enter both purchase and sale prices.');

    const capitalGain = salePrice - purchasePrice;
    let taxRate = 0;
    let taxOwed = 0;
    if (capitalGain > 0) {
      if (holdingPeriod === 'short') {
        taxRate = taxBracket; // short-term gains are taxed as ordinary income
      } else if (taxBracket <= 12) {
        taxRate = 0; // long-term 0% rate
      } else if (taxBracket <= 35) {
        taxRate = 15; // long-term 15% rate
      } else {
        taxRate = 20; // long-term 20% rate
      }
      taxOwed = capitalGain * (taxRate / 100);
    }
    const afterTaxProceeds = salePrice - taxOwed;

    show(form, {
      capitalGain: `${money(Math.abs(capitalGain))} ${capitalGain >= 0 ? 'gain' : 'loss'}`,
      taxRate: `${taxRate}%`,
      taxOwed: money(taxOwed),
      afterTaxProceeds: money(afterTaxProceeds),
    });
    const gain = form.closest('.calculator').querySelector('[data-out="capitalGain"]');
    gain.classList.toggle('is-positive', capitalGain >= 0);
    gain.classList.toggle('is-negative', capitalGain < 0);
    return true;
  },
};

document.querySelectorAll('form[data-calc]').forEach((form) => {
  const run = calculators[form.dataset.calc];
  if (!run) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.querySelector('[data-error]').textContent = '';
    if (run(form)) {
      form.closest('.calculator').querySelector('[data-results]').focus({ preventScroll: false });
    }
  });
});
