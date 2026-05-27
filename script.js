document.addEventListener('DOMContentLoaded', () => {
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
        leadRateInput.style.background = `linear-gradient(to right, #ced6e0 ${lrVal}%, #3f4b63 ${lrVal}%)`;
        
        const prVal = prospectRateInput.value;
        prospectRateInput.style.background = `linear-gradient(to right, #5c6a85 ${prVal}%, #3f4b63 ${prVal}%)`;
    }

    function drawChart(tProspects, tLeads, tCustomers) {
        chartArea.innerHTML = ''; // clear
        
        // Dynamic X-Axis labeling based on prospects
        // Max value on graph usually lines up with slightly more than total prospects
        let xMax = tProspects > 0 ? Math.ceil(tProspects / 6) * 6 : 120; 
        if(xMax < 120) xMax = 120; // fallback aesthetic minimum
        
        // Adjust the X Labels dynamically
        xAxisLabels.forEach((label, i) => {
            const val = Math.round((xMax / 6) * (i + 1));
            label.innerText = `${val} people`;
        });

        // Generate 6 rows for 6 months (cumulative growth to full size)
        for (let i = 1; i <= 6; i++) {
            const factor = i / 6;
            const pros = Math.round(tProspects * factor);
            const lds = Math.round(tLeads * factor);
            const cust = Math.round(tCustomers * factor);

            const row = document.createElement('div');
            row.className = 'chart-row';
            
            // Widths relative to xMax
            const pw = (pros / xMax) * 100;
            const lw = (lds / xMax) * 100;
            const cw = (cust / xMax) * 100;

            row.innerHTML = `
                <div class="chart-bar bar-prospects" style="width: ${pw}%"></div>
                <div class="chart-bar bar-leads" style="width: ${lw}%"></div>
                <div class="chart-bar bar-customers" style="width: ${cw}%"></div>
            `;
            
            // Hover Tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'chart-tooltip';
            tooltip.style.display = 'none';
            tooltip.innerHTML = `Month #${i}<br>Prospects: ${pros}<br>Leads: ${lds}<br>Customers: ${cust}`;
            row.appendChild(tooltip);

            row.addEventListener('mouseenter', () => tooltip.style.display = 'block');
            row.addEventListener('mouseleave', () => tooltip.style.display = 'none');

            chartArea.appendChild(row);
        }
    }

    // Event Listeners
    const inputs = [totalRevenueInput, avgOrderValueInput, leadRateInput, prospectRateInput];
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            calculate();
            updateSliderStyles();
        });
    });

    // Initial render
    calculate();
    updateSliderStyles();
    
    // Set initial custom slider backgrounds
    leadRateInput.style.background = `linear-gradient(to right, #ced6e0 40%, #3f4b63 40%)`;
    prospectRateInput.style.background = `linear-gradient(to right, #5c6a85 20%, #3f4b63 20%)`;
});