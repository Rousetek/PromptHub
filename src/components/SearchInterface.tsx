
import { useState } from "react";
import { Search, Filter, SortAsc, Grid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RepositoryCard from "./RepositoryCard";

const SearchInterface = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "copywriting", label: "Copywriting" },
    { value: "development", label: "Development" },
    { value: "marketing", label: "Marketing" },
    { value: "content", label: "Content Creation" },
    { value: "analysis", label: "Data Analysis" },
    { value: "automation", label: "Automation" }
  ];

  const sortOptions = [
    { value: "relevance", label: "Best Match" },
    { value: "stars", label: "Most Stars" },
    { value: "forks", label: "Most Forks" },
    { value: "updated", label: "Recently Updated" },
    { value: "created", label: "Newest" }
  ];

  const searchResults = [
    {
      id: 1,
      name: "email-marketing-templates",
      author: "marketingpro",
      description: "High-converting email marketing prompts for different industries and use cases",
      tags: ["email", "marketing", "templates", "conversion"],
      stars: 342,
      forks: 78,
      lastUpdated: "4 hours ago",
      license: "MIT",
      promptCount: 24
    },
    {
      id: 2,
      name: "technical-documentation",
      author: "docmaster",
      description: "AI prompts for generating clear, comprehensive technical documentation",
      tags: ["documentation", "technical-writing", "apis", "guides"],
      stars: 198,
      forks: 45,
      lastUpdated: "1 day ago",
      license: "Apache 2.0",
      promptCount: 18
    },
    {
      id: 3,
      name: "social-media-content",
      author: "socialguru",
      description: "Engaging social media post prompts for various platforms and audiences",
      tags: ["social-media", "content", "engagement", "platforms"],
      stars: 156,
      forks: 32,
      lastUpdated: "2 days ago",
      license: "MIT",
      promptCount: 31
    }
  ];

  const popularTags = [
    "copywriting", "marketing", "development", "content", "automation", 
    "analysis", "writing", "templates", "email", "social-media"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search repositories, prompts, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">License</label>
                  <div className="space-y-2">
                    {["MIT", "Apache 2.0", "GPL-3.0", "BSD-3-Clause"].map((license) => (
                      <label key={license} className="flex items-center space-x-2 text-sm">
                        <input type="checkbox" className="rounded" />
                        <span>{license}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Stars</label>
                  <div className="space-y-2">
                    {["100+", "50+", "10+", "Any"].map((range) => (
                      <label key={range} className="flex items-center space-x-2 text-sm">
                        <input type="radio" name="stars" className="rounded" />
                        <span>{range}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Grid/List */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {searchResults.length} repositories found
              </p>
            </div>

            <div className={`space-y-4 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0' : ''}`}>
              {searchResults.map((repo) => (
                <RepositoryCard
                  key={repo.id}
                  repository={repo}
                  onFork={() => console.log(`Fork ${repo.name}`)}
                  onStar={() => console.log(`Star ${repo.name}`)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchInterface;
