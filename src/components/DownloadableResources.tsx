
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import PDFDownloader from "./PDFDownloader";
import { whitepapers, useCases } from "@/data/whitepapers";

const DownloadableResources = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Free Resources & White Papers
          </h2>
          <p className="text-lg text-purple-200 max-w-3xl mx-auto">
            Download our comprehensive guides and case studies to accelerate your AI automation journey
          </p>
        </div>

        <div className="space-y-12">
          {/* White Papers */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-blue-400" />
              White Papers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {whitepapers.map((paper) => (
                <Card key={paper.id} className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{paper.title}</CardTitle>
                    <CardDescription className="text-purple-200">
                      {paper.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PDFDownloader
                      title={paper.title}
                      description={paper.description}
                      content={paper.content}
                      filename={paper.filename}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Download className="w-6 h-6 mr-3 text-green-400" />
              Use Case Examples
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {useCases.map((useCase) => (
                <Card key={useCase.id} className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{useCase.title}</CardTitle>
                    <CardDescription className="text-purple-200">
                      {useCase.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PDFDownloader
                      title={useCase.title}
                      description={useCase.description}
                      content={useCase.content}
                      filename={useCase.filename}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadableResources;
