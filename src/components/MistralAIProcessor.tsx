import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, Search, Globe, Cpu } from 'lucide-react';
import { useMistralAI, type MistralResponse } from '@/hooks/useMistralAI';
import { useToast } from '@/hooks/use-toast';

const MistralAIProcessor = () => {
  const [activeTab, setActiveTab] = useState('text-inference');
  const [prompt, setPrompt] = useState('');
  const [url, setUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [model, setModel] = useState('mistral-large-latest');
  const [maxTokens, setMaxTokens] = useState(1000);
  const [temperature, setTemperature] = useState(0.7);
  const [results, setResults] = useState<MistralResponse | null>(null);

  const { 
    loading, 
    error, 
    processTextInference, 
    processWebSearch, 
    processWebScrape, 
    processAITask 
  } = useMistralAI();

  const { toast } = useToast();

  const handleProcess = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Missing Input',
        description: 'Please provide a prompt for processing.',
        variant: 'destructive',
      });
      return;
    }

    try {
      let result: MistralResponse;
      const options = { model, maxTokens, temperature };

      switch (activeTab) {
        case 'text-inference':
          result = await processTextInference(prompt, options);
          break;
        case 'web-search':
          if (!searchQuery.trim()) {
            toast({
              title: 'Missing Search Query',
              description: 'Please provide a search query.',
              variant: 'destructive',
            });
            return;
          }
          result = await processWebSearch(searchQuery, prompt, options);
          break;
        case 'web-scrape':
          if (!url.trim()) {
            toast({
              title: 'Missing URL',
              description: 'Please provide a URL to scrape.',
              variant: 'destructive',
            });
            return;
          }
          result = await processWebScrape(url, prompt, options);
          break;
        case 'ai-processing':
          result = await processAITask(prompt, options);
          break;
        default:
          throw new Error('Invalid processing type');
      }

      setResults(result);
    } catch (err) {
      console.error('Processing failed:', err);
    }
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Processing Results
            <Badge variant="outline">{results.type}</Badge>
          </CardTitle>
          <CardDescription>
            Processed with {results.model} at {new Date(results.processedAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.result && (
            <div>
              <Label className="text-sm font-semibold">AI Response:</Label>
              <div className="mt-2 p-4 bg-muted rounded-lg whitespace-pre-wrap">
                {results.result}
              </div>
            </div>
          )}

          {results.analysis && (
            <div>
              <Label className="text-sm font-semibold">Analysis:</Label>
              <div className="mt-2 p-4 bg-muted rounded-lg whitespace-pre-wrap">
                {results.analysis}
              </div>
            </div>
          )}

          {results.searchResults && results.searchResults.length > 0 && (
            <div>
              <Label className="text-sm font-semibold">Search Results:</Label>
              <div className="mt-2 space-y-3">
                {results.searchResults.map((result, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">{result.title}</h4>
                    <a 
                      href={result.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {result.url}
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">{result.snippet}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.scrapeResult && (
            <div>
              <Label className="text-sm font-semibold">Scraped Content:</Label>
              <div className="mt-2 p-3 border rounded-lg">
                <h4 className="font-medium text-sm">{results.scrapeResult.title}</h4>
                <a 
                  href={results.scrapeResult.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  {results.scrapeResult.url}
                </a>
                <div className="text-xs text-muted-foreground mt-1">
                  Word count: {results.scrapeResult.metadata.wordCount} | 
                  Extracted: {new Date(results.scrapeResult.metadata.extractedAt).toLocaleString()}
                </div>
                <div className="mt-2 max-h-32 overflow-y-auto text-sm">
                  {results.scrapeResult.content.substring(0, 500)}...
                </div>
              </div>
            </div>
          )}

          {results.usage && (
            <div>
              <Label className="text-sm font-semibold">Usage:</Label>
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <span>Prompt tokens: {results.usage.prompt_tokens}</span>
                <span>Completion tokens: {results.usage.completion_tokens}</span>
                <span>Total tokens: {results.usage.total_tokens}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Mistral AI Processor
          </CardTitle>
          <CardDescription>
            Advanced AI processing for text inference, web searching, web scraping, and general AI tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="text-inference" className="flex items-center gap-1">
                <Cpu className="h-4 w-4" />
                Text Inference
              </TabsTrigger>
              <TabsTrigger value="web-search" className="flex items-center gap-1">
                <Search className="h-4 w-4" />
                Web Search
              </TabsTrigger>
              <TabsTrigger value="web-scrape" className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                Web Scrape
              </TabsTrigger>
              <TabsTrigger value="ai-processing" className="flex items-center gap-1">
                <Brain className="h-4 w-4" />
                AI Processing
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-4">
              {/* Common Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mistral-large-latest">Mistral Large (Latest)</SelectItem>
                      <SelectItem value="mistral-medium-latest">Mistral Medium (Latest)</SelectItem>
                      <SelectItem value="mistral-small-latest">Mistral Small (Latest)</SelectItem>
                      <SelectItem value="mistral-tiny">Mistral Tiny</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(Number(e.target.value))}
                    min="100"
                    max="4000"
                  />
                </div>
                <div>
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    min="0"
                    max="1"
                    step="0.1"
                  />
                </div>
              </div>

              <TabsContent value="text-inference" className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Text Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Enter your text for inference and analysis..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="web-search" className="space-y-4">
                <div>
                  <Label htmlFor="searchQuery">Search Query</Label>
                  <Input
                    id="searchQuery"
                    placeholder="Enter your search terms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="prompt">Analysis Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe what you want to analyze from the search results..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="web-scrape" className="space-y-4">
                <div>
                  <Label htmlFor="url">URL to Scrape</Label>
                  <Input
                    id="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="prompt">Analysis Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe what information you want to extract from the webpage..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="ai-processing" className="space-y-4">
                <div>
                  <Label htmlFor="prompt">AI Task Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe the AI task you want to perform..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                  />
                </div>
              </TabsContent>

              <Button 
                onClick={handleProcess} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Process with Mistral AI
                  </>
                )}
              </Button>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {renderResults()}
    </div>
  );
};

export default MistralAIProcessor;