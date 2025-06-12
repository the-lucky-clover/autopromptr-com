
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

interface PDFDownloaderProps {
  title: string;
  description: string;
  content: string;
  filename: string;
}

const PDFDownloader = ({ title, description, content, filename }: PDFDownloaderProps) => {
  const generatePDF = () => {
    // Create a new window for the PDF content
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow popups to download the PDF');
      return;
    }

    // HTML content for the PDF with letterhead
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
              background: white;
            }
            
            .letterhead {
              border-bottom: 3px solid #8B5CF6;
              padding-bottom: 20px;
              margin-bottom: 40px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            
            .logo-section {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            
            .logo-icon {
              width: 40px;
              height: 40px;
              background: linear-gradient(135deg, #3B82F6, #8B5CF6);
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 20px;
            }
            
            .company-name {
              font-size: 24px;
              font-weight: bold;
              background: linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899);
              -webkit-background-clip: text;
              background-clip: text;
              color: transparent;
            }
            
            .contact-info {
              text-align: right;
              font-size: 12px;
              color: #666;
            }
            
            h1 {
              color: #8B5CF6;
              font-size: 32px;
              margin-bottom: 10px;
              font-weight: 700;
            }
            
            .subtitle {
              color: #666;
              font-size: 16px;
              margin-bottom: 30px;
              font-style: italic;
            }
            
            h2 {
              color: #3B82F6;
              font-size: 24px;
              margin-top: 30px;
              margin-bottom: 15px;
              border-left: 4px solid #8B5CF6;
              padding-left: 15px;
            }
            
            h3 {
              color: #333;
              font-size: 18px;
              margin-top: 25px;
              margin-bottom: 10px;
            }
            
            p {
              margin-bottom: 15px;
              text-align: justify;
            }
            
            .highlight {
              background: linear-gradient(120deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #8B5CF6;
              margin: 20px 0;
            }
            
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="letterhead">
            <div class="logo-section">
              <div class="logo-icon">⚡</div>
              <div class="company-name">AutoPromptr</div>
            </div>
            <div class="contact-info">
              thepremiumbrand@gmail.com<br>
              +1 (555) 123-4567<br>
              www.autopromptr.com
            </div>
          </div>
          
          <h1>${title}</h1>
          <div class="subtitle">${description}</div>
          
          <div class="highlight">
            <strong>Executive Summary:</strong> This document provides comprehensive insights into modern AI automation workflows and best practices for prompt engineering at scale.
          </div>
          
          ${content}
          
          <div class="footer">
            <p><strong>© 2025 AutoPromptr. All rights reserved.</strong></p>
            <p>This document contains proprietary information. Unauthorized distribution is prohibited.</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1000);
  };

  return (
    <Button
      onClick={generatePDF}
      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg flex items-center space-x-2"
    >
      <Download className="w-4 h-4" />
      <span>Download {title}</span>
    </Button>
  );
};

export default PDFDownloader;
