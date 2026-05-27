document.addEventListener('DOMContentLoaded', () => {
    // Localization
    const translations = {
        en: {
            language: "Language", currency: "Currency", start: "Campaign Start", end: "Campaign End",
            revenue: "Total Revenue", avgOrder: "Avg. Order Value", months: "Months",
            prospects: "Prospects", leads: "Leads", customers: "Customers",
            leadRate: "Lead Response Rate", prospectRate: "Prospect Response Rate",
            people: "people", month: "Month"
        },
        bg: {
            language: "Език", currency: "Валута", start: "Начало на кампания", end: "Край на кампания",
            revenue: "Общи приходи", avgOrder: "Ср. стойност на поръчка", months: "Месеци",
            prospects: "Контакти (Prospects)", leads: "Потенц. клиенти (Leads)", customers: "Клиенти",
            leadRate: "Процент отговор (Leads)", prospectRate: "Процент отговор (Prospects)",
            people: "души", month: "Месец"
        },
        de: {
            language: "Sprache", currency: "Währung", start: "Kampagnenstart", end: "Kampagnenende",
            revenue: "Gesamtumsatz", avgOrder: "Durchschn. Bestellwert", months: "Monate",
            prospects: "Interessenten", leads: "Leads", customers: "Kunden",
            leadRate: "Lead-Rücklaufquote", prospectRate: "Interessenten-Rücklaufquote",
            people: "Personen", month: "Monat"
        }
    };
    let currentLang = 'en';

    // UI Translation Elements
    const langSelect = document.getElementById('languageSelect');
    const lblLanguage = document.getElementById('lblLanguage');
    const lblCurrency = document.getElementById('lblCurrency');
    const lblStart = document.getElementById('lblStart');
    const lblEnd = document.getElementById('lblEnd');
    const lblRevenue = document.getElementById('lblRevenue');
    const lblAvgOrder = document.getElementById('lblAvgOrder');
    const lblMonths = document.getElementById('lblMonths');
    const lblCardProspects = document.getElementById('lblCardProspects');
    const lblCardLeads = document.getElementById('lblCardLeads');
    const lblCardCustomers = document.getElementById('lblCardCustomers');
    const lblLeadRate = document.getElementById('lblLeadRate');
    const lblProspectRate = document.getElementById('lblProspectRate');

    // Inputs
    const totalRevenueInput = document.getElementById('totalRevenue');
    const avgOrderValueInput = document.getElementById('avgOrderValue');
    const leadRateInput = document.getElementById('leadRate');
    const prospectRateInput = document.getElementById('prospectRate');

    // Outputs
    const prospectsVal = document.getElementById('prospectsVal');
    const leadsVal = document.getElementById('leadsVal');
    const customersVal = document.getElementById('customersVal');
    
    const prospectsPercent = document.getElementById('prospectsPercent');
    const leadsPercent = document.getElementById('leadsPercent');
    const customersPercent = document.getElementById('customersPercent');
    
    const prospectsBar = document.getElementById('prospectsBar');
    const leadsBar = document.getElementById('leadsBar');
    const customersBar = document.getElementById('customersBar');

    const leadRateVal = document.getElementById('leadRateVal');
    const prospectRateVal = document.getElementById('prospectRateVal');
    
    const chartArea = document.getElementById('chartArea');
    const xLabel0 = document.getElementById('xLabel0');
    const xAxisLabels = [
        document.getElementById('xLabel20'),
        document.getElementById('xLabel40'),
        document.getElementById('xLabel60'),
        document.getElementById('xLabel80'),
        document.getElementById('xLabel100'),
        document.getElementById('xLabel120')
    ];

    // Functions
    function calculate() {
        // Values setup
        const rev = parseFloat(totalRevenueInput.value) || 0;
        const avgOrd = parseFloat(avgOrderValueInput.value) || 1;
        const leadRt = parseFloat(leadRateInput.value) / 100;
        const prospRt = parseFloat(prospectRateInput.value) / 100;

        // Formula 01: Customers = Revenue / Avg Order Value
        const customers = Math.round(rev / avgOrd);
        
        // Formula 02: Leads = Customers * 100 / Lead Response rate
        const leads = Math.round(customers / (leadRt || 0.01));
        
        // Formula 03: Prospects = Leads * 100 / Prospect Response rate
        const prospects = Math.round(leads / (prospRt || 0.01));

        // Update Labels & Slider Texts
        leadRateVal.innerText = (leadRt * 100).toFixed(2) + "%";
        prospectRateVal.innerText = (prospRt * 100).toFixed(2) + "%";

        prospectsVal.innerText = prospects;
        leadsVal.innerText = leads;
        customersVal.innerText = customers;

        // Calculate card percentages (Prospect is 100% baseline)
        let prcPct = 100;
        let ldsPct = prospects > 0 ? Math.round((leads / prospects) * 100) : 0;
        let cstPct = prospects > 0 ? Math.round((customers / prospects) * 100) : 0;

        prospectsPercent.innerText = "100%";
        leadsPercent.innerText = `${ldsPct}%`;
        customersPercent.innerText = `${cstPct}%`;

        prospectsBar.style.width = "100%";
        leadsBar.style.width = `${ldsPct}%`;
        customersBar.style.width = `${cstPct}%`;

        drawChart(prospects, leads, customers);
    }

    function updateSliderStyles() {
        const lrVal = leadRateInput.value;
        leadRateInput.style.background = `linear-gradient(to right, #10b981 ${lrVal}%, #3f4b63 ${lrVal}%)`;
        
        const prVal = prospectRateInput.value;
        prospectRateInput.style.background = `linear-gradient(to right, #3b82f6 ${prVal}%, #3f4b63 ${prVal}%)`;
    }

    function translateUI() {
        const text = translations[currentLang];
        lblLanguage.innerText = text.language;
        lblCurrency.innerText = text.currency;
        lblStart.innerText = text.start;
        lblEnd.innerText = text.end;
        lblRevenue.innerText = text.revenue;
        lblAvgOrder.innerText = text.avgOrder;
        lblMonths.innerText = text.months;
        lblCardProspects.innerText = text.prospects;
        lblCardLeads.innerText = text.leads;
        lblCardCustomers.innerText = text.customers;
        lblLeadRate.innerText = text.leadRate;
        lblProspectRate.innerText = text.prospectRate;
    }

    function drawChart(tProspects, tLeads, tCustomers) {
        chartArea.innerHTML = ''; // clear
        const t = translations[currentLang];
        
        let xMax = 120;
        
        // Base 0 label
        xLabel0.innerText = `0 ${t.people}`;
        
        // Labels fixed as requested
        xAxisLabels.forEach((label, i) => {
            const val = 20 * (i + 1);
            label.innerText = `${val} ${t.people}`;
        });

        // Generate 6 rows for 6 months (cumulative growth to full size)
        for (let i = 1; i <= 6; i++) {
            const factor = i / 6;
            const pros = Math.round(tProspects * factor);
            const lds = Math.round(tLeads * factor);
            const cust = Math.round(tCustomers * factor);

            const row = document.createElement('div');
            row.className = 'chart-row';
            
            // Widths relative to xMax (cap at 100% so they don't overflow the chart area)
            const pw = Math.min((pros / xMax) * 100, 100);
            const lw = Math.min((lds / xMax) * 100, 100);
            const cw = Math.min((cust / xMax) * 100, 100);

            row.innerHTML = `
                <div class="chart-bar bar-prospects" style="width: ${pw}%"></div>
                <div class="chart-bar bar-leads" style="width: ${lw}%"></div>
                <div class="chart-bar bar-customers" style="width: ${cw}%"></div>
            `;
            
            // Hover Tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'chart-tooltip';
            tooltip.style.display = 'none';
            tooltip.innerHTML = `${t.month} #${i}<br>${t.prospects}: ${pros}<br>${t.leads}: ${lds}<br>${t.customers}: ${cust}`;
            row.appendChild(tooltip);

            row.addEventListener('mouseenter', () => tooltip.style.display = 'block');
            row.addEventListener('mouseleave', () => tooltip.style.display = 'none');

            chartArea.appendChild(row);
        }
    }

    // Event Listeners
    langSelect.addEventListener('change', (e) => {
        currentLang = e.target.value;
        translateUI();
        calculate(); // Redraws chart correctly with new language translation
    });

    const currencySelect = document.getElementById('currencySelect');
    const currencySymbols = document.querySelectorAll('.currency-symbol');
    
    currencySelect.addEventListener('change', (e) => {
        const symbol = e.target.value;
        currencySymbols.forEach(el => el.innerText = symbol);
    });

    const inputs = [totalRevenueInput, avgOrderValueInput, leadRateInput, prospectRateInput];
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            calculate();
            updateSliderStyles();
        });
    });

    // Initial render
    translateUI();
    calculate();
    updateSliderStyles();
    
    // Set initial custom slider backgrounds
    leadRateInput.style.background = `linear-gradient(to right, #10b981 40%, #3f4b63 40%)`;
    prospectRateInput.style.background = `linear-gradient(to right, #3b82f6 20%, #3f4b63 20%)`;
});