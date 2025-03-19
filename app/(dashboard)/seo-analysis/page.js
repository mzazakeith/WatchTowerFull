"use client";

import { useState, useEffect } from 'react';
import { 
  GlobeAltIcon, 
  MagnifyingGlassIcon, 
  ArrowPathIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  LightBulbIcon,
  PlusIcon,
  ServerIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Link from 'next/link';

function ScoreCard({ title, score, previousScore, description, icon: Icon }) {
  const isImproved = score > previousScore;
  const percentChange = previousScore 
    ? Math.abs(Math.round((score - previousScore) / previousScore * 100)) 
    : 0;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {title}
              </div>
              <div className="text-2xl font-bold">
                {score}
                <span className="text-sm font-medium ml-1">/100</span>
              </div>
            </div>
          </div>
          {previousScore && (
            <Badge 
              className={isImproved 
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"}
            >
              {isImproved ? <ArrowUpIcon className="h-3 w-3 mr-1 inline" /> : <ArrowDownIcon className="h-3 w-3 mr-1 inline" />}
              {percentChange}%
            </Badge>
          )}
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function SEOIssueCard({ issue }) {
  const severityColors = {
    high: "text-red-600 dark:text-red-400",
    medium: "text-amber-600 dark:text-amber-400",
    low: "text-blue-600 dark:text-blue-400"
  };
  
  const severityIcons = {
    high: XCircleIcon,
    medium: ExclamationTriangleIcon,
    low: LightBulbIcon
  };
  
  const Icon = severityIcons[issue.severity] || ExclamationTriangleIcon;
  
  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className={`mt-1 ${severityColors[issue.severity]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-medium mb-1">{issue.title}</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
            {issue.description}
          </p>
          {issue.recommendation && (
            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded p-3 text-sm">
              <span className="font-medium">Recommendation: </span>
              {issue.recommendation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KeywordRankingTable({ keywords }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800">
            <th className="text-left py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400">Keyword</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400">Position</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400">Change</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400">Volume</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-500 dark:text-neutral-400">Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {keywords.map((keyword, index) => (
            <tr key={index} className="border-b border-neutral-200 dark:border-neutral-800">
              <td className="py-3 px-4 font-medium">{keyword.term}</td>
              <td className="py-3 px-4">{keyword.position}</td>
              <td className="py-3 px-4">
                {keyword.change === 0 ? (
                  <span className="text-neutral-500">—</span>
                ) : keyword.change > 0 ? (
                  <span className="text-green-600 dark:text-green-400 flex items-center">
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                    {keyword.change}
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400 flex items-center">
                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                    {Math.abs(keyword.change)}
                  </span>
                )}
              </td>
              <td className="py-3 px-4">{keyword.volume.toLocaleString()}</td>
              <td className="py-3 px-4">
                <div className="flex items-center">
                  <div className="w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mr-2">
                    <div 
                      className={`h-2 rounded-full ${
                        keyword.difficulty < 30 
                          ? "bg-green-500" 
                          : keyword.difficulty < 60 
                            ? "bg-yellow-500" 
                            : "bg-red-500"
                      }`}
                      style={{ width: `${keyword.difficulty}%` }}
                    ></div>
                  </div>
                  <span className="text-sm">{keyword.difficulty}/100</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SEOAnalysisPage() {
  const [url, setUrl] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [services, setServices] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [seoData, setSeoData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch services
  useEffect(() => {
    async function fetchServices() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/services');
        
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        
        const data = await response.json();
        setServices(data);
      } catch (err) {
        console.error('Error fetching services:', err);
        toast.error('Failed to load services');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchServices();
  }, []);

  // Handle service selection
  const handleServiceChange = (value) => {
    setSelectedService(value);
    const service = services.find(s => s._id === value);
    if (service) {
      setUrl(service.url);
    }
  };

  // Simulate fetching SEO data
  async function analyzeSEO(e) {
    e.preventDefault();

    if (!url) {
      toast.error('Please select a service or enter a URL to analyze');
      return;
    }

    try {
      setAnalyzing(true);
      setError(null);

      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate SEO data
      const mockSeoData = {
        url: url,
        lastUpdated: new Date().toISOString(),
        overallScore: 72,
        previousScore: 65,
        metrics: {
          performance: { score: 78, previousScore: 71, description: "Page loads quickly on most connections" },
          seo: { score: 82, previousScore: 70, description: "Good optimization but some issues to fix" },
          accessibility: { score: 64, previousScore: 64, description: "Several accessibility issues detected" },
          bestPractices: { score: 65, previousScore: 58, description: "Some web best practices need improvement" }
        },
        issues: [
          {
            severity: "high",
            title: "Missing meta descriptions",
            description: "5 pages are missing meta descriptions which are crucial for SEO.",
            recommendation: "Add unique, descriptive meta descriptions to all pages."
          },
          {
            severity: "medium",
            title: "Low text-to-HTML ratio",
            description: "Your pages have a low text-to-HTML ratio which might impact SEO negatively.",
            recommendation: "Increase the amount of useful text content relative to code."
          },
          {
            severity: "low",
            title: "Images missing alt text",
            description: "12 images are missing alternative text attributes.",
            recommendation: "Add descriptive alt text to all images for better accessibility and SEO."
          }
        ],
        keywords: [
          { term: "responsive website design", position: 3, change: 2, volume: 12500, difficulty: 75 },
          { term: "web monitoring tools", position: 5, change: 0, volume: 5400, difficulty: 62 },
          { term: "website uptime tracker", position: 12, change: -3, volume: 3200, difficulty: 45 },
          { term: "best site monitoring", position: 8, change: 1, volume: 8700, difficulty: 58 },
          { term: "website performance metrics", position: 15, change: 4, volume: 2800, difficulty: 40 }
        ],
        competitors: [
          { domain: "competitor1.com", score: 84, keywordOverlap: 75, backlinks: 12500 },
          { domain: "competitor2.com", score: 79, keywordOverlap: 62, backlinks: 8700 },
          { domain: "competitor3.com", score: 67, keywordOverlap: 45, backlinks: 9300 }
        ]
      };
      
      setSeoData(mockSeoData);
      setAnalyzed(true);
      toast.success('SEO analysis completed successfully');
    } catch (error) {
      console.error('Error analyzing SEO:', error);
      setError('Failed to analyze SEO. Please try again.');
      toast.error('Failed to analyze SEO');
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">SEO Analysis</h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Analyze and optimize your website's search engine visibility
          </p>
        </div>
      </div>

      {/* URL Analysis Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Analyze Website</CardTitle>
          <CardDescription>
            Select a service or enter a URL to get a comprehensive SEO analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={analyzeSEO} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="service" className="mb-2 block text-sm font-medium">Select Service</Label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    {isLoading ? (
                      <div className="h-10 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md"></div>
                    ) : (
                      <Select value={selectedService} onValueChange={handleServiceChange}>
                        <SelectTrigger id="service" className="w-full">
                          <SelectValue placeholder="Choose a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.length === 0 ? (
                            <SelectItem value="no-services" disabled>No services available</SelectItem>
                          ) : (
                            services.map(service => (
                              <SelectItem key={service._id} value={service._id}>
                                <div className="flex items-center">
                                  <span>{service.name}</span>
                                  <Badge className="ml-2" variant="outline">{service.status}</Badge>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <Link href="/services/add">
                    <Button variant="outline" type="button" size="icon">
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                  Choose from your monitored services or add a new one
                </p>
              </div>

              <div>
                <Label htmlFor="url" className="mb-2 block text-sm font-medium">Or Enter URL Directly</Label>
                <div className="relative">
                  <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <Input 
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    className="pl-10"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (selectedService && e.target.value !== services.find(s => s._id === selectedService)?.url) {
                        setSelectedService('');
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button type="submit" disabled={analyzing || (!url && !selectedService)}>
                {analyzing ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {analyzed && seoData && (
        <>
          {/* Overview Section */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ScoreCard 
              title="Performance Score" 
              score={seoData.metrics.performance.score} 
              previousScore={seoData.metrics.performance.previousScore}
              description={seoData.metrics.performance.description}
              icon={ChartBarIcon}
            />
            <ScoreCard 
              title="SEO Score" 
              score={seoData.metrics.seo.score} 
              previousScore={seoData.metrics.seo.previousScore}
              description={seoData.metrics.seo.description}
              icon={MagnifyingGlassIcon}
            />
            <ScoreCard 
              title="Accessibility" 
              score={seoData.metrics.accessibility.score} 
              previousScore={seoData.metrics.accessibility.previousScore}
              description={seoData.metrics.accessibility.description}
              icon={CheckCircleIcon}
            />
            <ScoreCard 
              title="Best Practices" 
              score={seoData.metrics.bestPractices.score} 
              previousScore={seoData.metrics.bestPractices.previousScore}
              description={seoData.metrics.bestPractices.description}
              icon={DocumentTextIcon}
            />
          </div>

          {/* Detailed Analysis */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Detailed Analysis</CardTitle>
                  <CardDescription className="mt-1">
                    Comprehensive analysis of {seoData.url}
                  </CardDescription>
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Last updated: {new Date(seoData.lastUpdated).toLocaleString()}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="issues">
                <TabsList className="mb-6">
                  <TabsTrigger value="issues">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                    Issues
                  </TabsTrigger>
                  <TabsTrigger value="keywords">
                    <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                    Keywords
                  </TabsTrigger>
                  <TabsTrigger value="competitors">
                    <ChartBarIcon className="h-4 w-4 mr-2" />
                    Competitors
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="issues">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">
                        Found {seoData.issues.length} issues to fix
                      </h3>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                          {seoData.issues.filter(i => i.severity === 'high').length} High
                        </Badge>
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                          {seoData.issues.filter(i => i.severity === 'medium').length} Medium
                        </Badge>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                          {seoData.issues.filter(i => i.severity === 'low').length} Low
                        </Badge>
                      </div>
                    </div>

                    {seoData.issues.map((issue, index) => (
                      <SEOIssueCard key={index} issue={issue} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="keywords">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">
                        Keyword Rankings
                      </h3>
                      <Button variant="outline" size="sm">
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        Refresh Rankings
                      </Button>
                    </div>

                    <KeywordRankingTable keywords={seoData.keywords} />
                  </div>
                </TabsContent>

                <TabsContent value="competitors">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">
                        Competitor Analysis
                      </h3>
                      <Button variant="outline" size="sm">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Competitor
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {seoData.competitors.map((competitor, index) => (
                        <Card key={index}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{competitor.domain}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-neutral-500 dark:text-neutral-400">SEO Score:</span>
                                <span className="font-medium">{competitor.score}/100</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-neutral-500 dark:text-neutral-400">Keyword Overlap:</span>
                                <span className="font-medium">{competitor.keywordOverlap}%</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-neutral-500 dark:text-neutral-400">Backlinks:</span>
                                <span className="font-medium">{competitor.backlinks.toLocaleString()}</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                            <Button variant="ghost" size="sm" className="w-full">
                              View Details
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!analyzed && !analyzing && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-neutral-100 dark:bg-neutral-800 p-3 mb-4">
              <MagnifyingGlassIcon className="h-6 w-6 text-neutral-500" />
            </div>
            <h3 className="text-lg font-medium mb-1">No analysis yet</h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-center max-w-md">
              Enter your website URL above to get a comprehensive SEO analysis with performance metrics and recommendations.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="flex items-center gap-3 py-4">
            <XCircleIcon className="h-6 w-6 text-red-500" />
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 