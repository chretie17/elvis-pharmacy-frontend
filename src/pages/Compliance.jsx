import React, { useState } from 'react';
import { Button, Box, CircularProgress, Typography } from '@mui/material';
import api from '../api'; // Assuming you have an Axios instance configured

export default function ComplianceReport() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [reportGenerated, setReportGenerated] = useState(false);

    const generateComplianceReport = async () => {
        setLoading(true);
        setError('');
        setReportGenerated(false);

        try {
            const response = await api.post('/compliance/generate-compliance-report');
            const pdfOutput = response.data.pdfOutput;

            // Trigger the download of the PDF
            const link = document.createElement('a');
            link.href = pdfOutput;
            link.download = 'Compliance_Report.pdf';
            link.click();

            setReportGenerated(true);
        } catch (err) {
            setError('Failed to generate the compliance report.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ padding: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
                Compliance Report Generator
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Button variant="contained" color="primary" onClick={generateComplianceReport}>
                    Generate Compliance Report
                </Button>
            )}

            {reportGenerated && (
                <Typography variant="h6" color="success" sx={{ marginTop: 3 }}>
                    Report generated and download should start automatically.
                </Typography>
            )}

            {error && (
                <Typography variant="h6" color="error" sx={{ marginTop: 3 }}>
                    {error}
                </Typography>
            )}
        </Box>
    );
}
