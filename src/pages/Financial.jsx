import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Paper, CircularProgress, Divider, TextField } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../api';
import logo from '../assets/pharamcy.jpg';
import { Chart, ArcElement, Tooltip, Legend, PieController } from 'chart.js';

// Register the required components
Chart.register(ArcElement, Tooltip, Legend, PieController);

const theme = {
  primary: '#004d40',
  secondary: '#00796b',
  tertiary: '#26a69a',
  background: '#e0f2f1',
  text: '#00251a',
};

export default function FinancialReport() {
    const [summary, setSummary] = useState(null);
    const [breakdown, setBreakdown] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generatedTime, setGeneratedTime] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        fetchOverallData();
        setGeneratedTime(new Date().toLocaleString());
    }, []);

    const fetchOverallData = async () => {
        try {
            const summaryResponse = await api.get('/reports/summary');
            const breakdownResponse = await api.get('/reports/insurance-breakdown');
            setSummary(summaryResponse.data);
            setBreakdown(breakdownResponse.data);
        } catch (error) {
            console.error('Error fetching financial data', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDailyReport = async (date) => {
        try {
            const formattedDate = date.format('YYYY-MM-DD');
            const response = await api.get(`/reports/daily/${formattedDate}`);
            const { results, summary } = response.data;

            const aggregatedData = aggregateInsuranceData(results);

            setSummary(summary);
            setBreakdown(aggregatedData);
        } catch (error) {
            console.error('Error fetching daily report', error);
        }
    };

    const aggregateInsuranceData = (data) => {
        const insuranceMap = {};

        data.forEach((item) => {
            if (!insuranceMap[item.insurance_name]) {
                insuranceMap[item.insurance_name] = {
                    insurance_name: item.insurance_name,
                    totalPatients: 0,
                    totalCosts: 0,
                    totalFinalCosts: 0,
                    totalToClaimFromInsurance: 0,
                };
            }

            const insurance = insuranceMap[item.insurance_name];
            insurance.totalPatients += 1;
            insurance.totalCosts += parseFloat(item.total_cost);
            insurance.totalFinalCosts += parseFloat(item.final_cost);
            insurance.totalToClaimFromInsurance += parseFloat(item.total_cost) - parseFloat(item.final_cost);
        });

        return Object.values(insuranceMap);
    };

    const downloadOverallPDF = () => {
        generatePDF('Overall Financial Report');
    };

    const downloadDailyPDF = () => {
        generatePDF('Daily Financial Report');
    };

    const generatePDF = (title) => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        const margin = 15;

        // Helper function for adding a new page
        const addNewPage = () => {
            pdf.addPage();
            addHeader();
        };

        // Header function
        const addHeader = () => {
            pdf.setFillColor(0, 77, 64); // #004d40
            pdf.rect(0, 0, pageWidth, 25, 'F');
            pdf.addImage(logo, 'PNG', margin, 5, 15, 15);
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(16);
            pdf.text(title, pageWidth / 2, 15, { align: 'center' });
        };

        // Footer function
        const addFooter = () => {
            pdf.setFillColor(0, 77, 64); // #004d40
            pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.text(`Generated on: ${generatedTime} | Page ${pdf.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
        };

        // Add header to first page
        addHeader();

        // Executive Summary
        pdf.setTextColor(0);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text('Executive Summary', margin, 40);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text('This report provides a comprehensive overview of our financial performance,', margin, 50);
        pdf.text('including detailed breakdowns of costs, revenues, and insurance claims.', margin, 55);

        // Summary Table
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text('Financial Summary', margin, 70);
        pdf.autoTable({
            startY: 75,
            head: [['Description', 'Amount']],
            body: [
                ['Total Costs', `Rwf ${parseFloat(summary?.totalCosts).toFixed(2)}` || '0.00'],
                ['Total Final Costs', `Rwf ${parseFloat(summary?.totalFinalCosts).toFixed(2)}` || '0.00'],
                ['Total to Claim from Insurance', `Rwf ${parseFloat(summary?.totalToClaimFromInsurance).toFixed(2)}` || '0.00'],
            ],
            theme: 'striped',
            headStyles: { fillColor: [0, 77, 64], textColor: [255, 255, 255] },
            styles: { fontSize: 10 },
            columnStyles: { 1: { halign: 'right' } },
        });

        // Insurance Breakdown
        addNewPage();
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(0);
        pdf.text('Insurance Breakdown', margin, 40);
        pdf.autoTable({
            startY: 45,
            head: [['Insurance', 'Total Patients', 'Total Costs', 'Total Final Costs', 'Total to Claim']],
            body: breakdown.map(item => [
                item.insurance_name || 'N/A',
                item.totalPatients.toString() || '0',
                `Rwf ${parseFloat(item.totalCosts).toFixed(2)}` || 'Rwf 0.00',
                `Rwf ${parseFloat(item.totalFinalCosts).toFixed(2)}` || 'Rwf 0.00',
                `Rwf ${parseFloat(item.totalToClaimFromInsurance).toFixed(2)}` || 'Rwf 0.00',
            ]),
            theme: 'striped',
            headStyles: { fillColor: [0, 77, 64], textColor: [255, 255, 255] },
            styles: { fontSize: 9 },
            columnStyles: { 0: { cellWidth: 40 }, 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
        });

        // Charts
        addNewPage();
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text('Financial Charts', margin, 40);

        // Costs Breakdown Chart
        const costsChartData = breakdown.map(item => ({
            name: item.insurance_name,
            value: item.totalCosts
        }));
        pdf.setFontSize(12);
        pdf.text('Costs Breakdown by Insurance', margin, 50);
        pdf.addImage(createPieChart(costsChartData), 'PNG', margin, 55, 180, 100);

        // Patients Distribution Chart
        const patientsChartData = breakdown.map(item => ({
            name: item.insurance_name,
            value: item.totalPatients
        }));
        pdf.text('Patient Distribution by Insurance', margin, 165);
        pdf.addImage(createPieChart(patientsChartData), 'PNG', margin, 170, 180, 100);

        // Add footer to all pages
        for (let i = 1; i <= pdf.internal.getNumberOfPages(); i++) {
            pdf.setPage(i);
            addFooter();
        }

        // Save the PDF
        pdf.save(`${title.toLowerCase().replace(/ /g, '-')}.pdf`);
    };


    // Helper function to create pie charts
    const createPieChart = (data) => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.map(item => item.name),
                datasets: [{
                    data: data.map(item => item.value),
                    backgroundColor: [
                        '#004d40', '#00695c', '#00796b', '#00897b', '#009688',
                        '#26a69a', '#4db6ac', '#80cbc4', '#b2dfdb', '#e0f2f1'
                    ],
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });

        return canvas.toDataURL();
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor={theme.background}>
                <CircularProgress style={{ color: theme.primary }} />
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box id="financial-report" sx={{ padding: 4, backgroundColor: theme.background, minHeight: '100vh' }}>
                {/* Title Section */}
                <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={3}>
                    <img src={logo} alt="Logo" style={{ height: 60 }} />
                    <Box textAlign="center">
                        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: theme.primary }}>
                            Financial Dashboard
                        </Typography>
                        <Typography variant="h6" gutterBottom sx={{ color: theme.secondary }}>
                            Comprehensive Financial Analysis
                        </Typography>
                    </Box>
                    <Box textAlign="right">
                        <Typography variant="subtitle1" display="block" sx={{ color: theme.text }}>
                            Generated on: {generatedTime}
                        </Typography>
                        <Typography variant="subtitle1" display="block" sx={{ color: theme.text }}>
                            Generated by: Admin
                        </Typography>
                    </Box>
                </Box>
                <Divider sx={{ marginY: 3, backgroundColor: theme.primary }} />

                {/* Date Picker Section */}
                <Box sx={{ marginBottom: 4 }}>
                    <DatePicker
                        label="Select Date for Daily Report"
                        value={selectedDate}
                        onChange={(newValue) => {
                            setSelectedDate(newValue);
                            fetchDailyReport(newValue);
                        }}
                        renderInput={(params) => <TextField {...params} fullWidth sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: theme.primary } } }} />}
                    />
                </Box>

                {/* Summary Section */}
                <Paper elevation={3} sx={{ padding: 4, marginBottom: 4, backgroundColor: '#fff', borderRadius: '12px', border: `2px solid ${theme.primary}` }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: theme.primary }}>
                        Financial Summary
                    </Typography>
                    <Box display="flex" justifyContent="space-between" marginTop={2}>
                        <Typography variant="h6">Total Costs:</Typography>
                        <Typography variant="h6" sx={{ color: theme.secondary }}>{summary?.totalCosts}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" marginTop={1}>
                        <Typography variant="h6">Total Final Costs:</Typography>
                        <Typography variant="h6" sx={{ color: theme.secondary }}>{summary?.totalFinalCosts}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" marginTop={1}>
                        <Typography variant="h6">Total to Claim from Insurance:</Typography>
                        <Typography variant="h6" sx={{ color: theme.secondary }}>{summary?.totalToClaimFromInsurance}</Typography>
                    </Box>
                </Paper>

                {/* Insurance Breakdown Section */}
                <Paper elevation={3} sx={{ padding: 4, backgroundColor: '#fff', borderRadius: '12px', border: `2px solid ${theme.primary}`, marginBottom: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: theme.primary }}>
                        Insurance Breakdown
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={breakdown}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="insurance_name" />
                            <YAxis />
                            <RechartsTooltip />
                            <RechartsLegend />
                            <Area type="monotone" dataKey="totalCosts" stackId="1" stroke={theme.primary} fill={theme.primary} />
                            <Area type="monotone" dataKey="totalFinalCosts" stackId="1" stroke={theme.secondary} fill={theme.secondary} />
                            <Area type="monotone" dataKey="totalToClaimFromInsurance" stackId="1" stroke={theme.tertiary} fill={theme.tertiary} />
                        </AreaChart>
                    </ResponsiveContainer>
                </Paper>

                {/* Patient Distribution */}
                <Paper elevation={3} sx={{ padding: 4, backgroundColor: '#fff', borderRadius: '12px', border: `2px solid ${theme.primary}`, marginBottom: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: theme.primary }}>
                        Patient Distribution by Insurance
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={breakdown}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="insurance_name" />
                            <YAxis />
                            <RechartsTooltip />
                            <RechartsLegend />
                            <Bar dataKey="totalPatients" fill={theme.primary} />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>

                {/* Download Buttons */}
                <Box textAlign="center" marginTop={4} display="flex" justifyContent="space-around">
                    <Button
                        variant="contained"
                        onClick={downloadOverallPDF}
                        sx={{ backgroundColor: theme.primary, '&:hover': { backgroundColor: theme.secondary }, padding: '10px 20px', fontSize: '16px' }}
                    >
                        Download Overall Report PDF
                    </Button>
                    <Button
                        variant="contained"
                        onClick={downloadDailyPDF}
                        sx={{ backgroundColor: theme.secondary, '&:hover': { backgroundColor: theme.tertiary }, padding: '10px 20px', fontSize: '16px' }}
                    >
                        Download Daily Report PDF
                    </Button>
                </Box>
            </Box>
        </LocalizationProvider>
    );
}
