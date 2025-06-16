
import { GitFork, Star, Clock, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RepositoryCardProps {
  repository: {
    id: number;
    name: string;
    author: string;
    description: string;
    tags: string[];
    stars: number;
    forks: number;
    lastUpdated: string;
    license: string;
    promptCount?: number;
  };
  onFork?: () => void;
  onStar?: () => void;
}

const RepositoryCard = ({ repository, onFork, onStar }: RepositoryCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold hover:text-blue-600 cursor-pointer">
              <span className="text-blue-600 font-medium">{repository.author}</span>
              <span className="text-gray-400 mx-1">/</span>
              <span>{repository.name}</span>
            </CardTitle>
            <CardDescription className="mt-2 text-gray-600 leading-relaxed">
              {repository.description}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Button variant="outline" size="sm" onClick={onStar}>
              <Star className="h-3 w-3 mr-1" />
              {repository.stars}
            </Button>
            <Button variant="outline" size="sm" onClick={onFork}>
              <GitFork className="h-3 w-3 mr-1" />
              {repository.forks}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {repository.tags.slice(0, 4).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
              >
                {tag}
              </Badge>
            ))}
            {repository.tags.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{repository.tags.length - 4}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {repository.promptCount && (
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>{repository.promptCount} prompts</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <FileText className="h-3 w-3" />
              <span>{repository.license}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{repository.lastUpdated}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepositoryCard;
