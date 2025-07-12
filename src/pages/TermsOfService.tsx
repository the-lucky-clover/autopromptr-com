
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-900 via-blue-900 to-purple-600">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={() => navigate(-1)}
            variant="ghost" 
            className="text-white hover:bg-white/10 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-8">
              <FileText className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
            </div>
            
            <div className="prose prose-invert prose-purple max-w-none text-gray-200 space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Acceptance of Terms</h2>
                <p>
                  By accessing and using AutoPromptr, you accept and agree to be bound by the terms and provision 
                  of this agreement. These Terms of Service govern your use of our AI prompt automation platform 
                  and related services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Service Description</h2>
                <p>
                  AutoPromptr is an AI prompt automation platform that enables users to batch process, enhance, 
                  and deploy prompts across various AI coding platforms. Our service includes web-based tools, 
                  API integrations, and automated workflow capabilities.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">User Responsibilities</h2>
                <p>As a user of AutoPromptr, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>Use the service in compliance with all applicable laws and regulations</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Not attempt to interfere with or disrupt the service</li>
                  <li>Respect the intellectual property rights of others</li>
                  <li>Use the service only for legitimate business and personal purposes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Intellectual Property</h2>
                <p>
                  AutoPromptr is released under the MIT License, making the source code freely available for use, 
                  modification, and distribution. However, our branding, documentation, and proprietary content 
                  remain protected by applicable intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">MIT License Terms</h2>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 font-mono text-sm">
                  <p className="mb-4">MIT License</p>
                  <p className="mb-4">Copyright (c) 2024 AutoPromptr</p>
                  <p className="mb-4">
                    Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
                    and associated documentation files (the "Software"), to deal in the Software without restriction, 
                    including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
                    and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
                    subject to the following conditions:
                  </p>
                  <p className="mb-4">
                    The above copyright notice and this permission notice shall be included in all copies or substantial 
                    portions of the Software.
                  </p>
                  <p>
                    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT 
                    LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Service Availability</h2>
                <p>
                  While we strive to maintain high availability, AutoPromptr is provided "as is" without warranties 
                  of any kind. We do not guarantee uninterrupted service and may experience downtime for maintenance 
                  or due to factors beyond our control.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, AutoPromptr and its contributors shall not be liable for any 
                  indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, 
                  whether incurred directly or indirectly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibread text-white mb-4">Termination</h2>
                <p>
                  You may terminate your use of AutoPromptr at any time. We reserve the right to terminate or suspend 
                  access to our service immediately, without prior notice, for conduct that we believe violates these 
                  Terms of Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. Changes will be effective immediately upon 
                  posting. Your continued use of AutoPromptr after changes are posted constitutes your acceptance of 
                  the updated terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Contact Information</h2>
                <p>
                  If you have any questions about these Terms of Service, please contact us at legal@autopromptr.com 
                  or through our support channels.
                </p>
              </section>

              <div className="text-sm text-gray-400 mt-8 pt-4 border-t border-white/20">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
