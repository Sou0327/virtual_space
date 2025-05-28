import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

// Mock data for demonstration
const mockSpaces = [
  {
    id: '1',
    title: 'アートギャラリー',
    description: '私の作品を展示している空間です',
    creator: 'アーティストA',
    visitCount: 1250,
    isPublic: true,
    thumbnail: null,
    category: 'art'
  },
  {
    id: '2',
    title: 'ライブステージ',
    description: '音楽ライブを開催する特別な空間',
    creator: 'ミュージシャンB',
    visitCount: 3400,
    isPublic: true,
    thumbnail: null,
    category: 'music'
  },
  {
    id: '3',
    title: 'カフェ空間',
    description: 'リラックスできる癒しの空間',
    creator: 'カフェオーナーC',
    visitCount: 890,
    isPublic: true,
    thumbnail: null,
    category: 'lifestyle'
  },
  {
    id: '4',
    title: 'ゲーム配信ルーム',
    description: 'ゲーム実況とファンとの交流空間',
    creator: 'ゲーマーD',
    visitCount: 5600,
    isPublic: true,
    thumbnail: null,
    category: 'gaming'
  },
];

const categories = [
  { id: 'all', name: 'すべて', icon: '🌟' },
  { id: 'art', name: 'アート', icon: '🎨' },
  { id: 'music', name: '音楽', icon: '🎵' },
  { id: 'gaming', name: 'ゲーム', icon: '🎮' },
  { id: 'lifestyle', name: 'ライフスタイル', icon: '☕' },
];

export const ExplorePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const filteredSpaces = mockSpaces.filter(space => {
    const matchesSearch = space.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.creator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || space.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedSpaces = [...filteredSpaces].sort((a, b) => {
    if (sortBy === 'popular') {
      return b.visitCount - a.visitCount;
    } else if (sortBy === 'newest') {
      return 0; // Would sort by creation date in real implementation
    }
    return 0;
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">空間を探索</h1>
          <p className="text-lg text-gray-600">
            インフルエンサーが作成した素晴らしいバーチャル空間を発見しましょう
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="空間名やクリエイター名で検索..."
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="popular">人気順</option>
                  <option value="newest">新着順</option>
                </select>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            {sortedSpaces.length} 件の空間が見つかりました
          </p>
        </div>

        {/* Spaces Grid */}
        {sortedSpaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedSpaces.map((space) => (
              <Card key={space.id} className="group hover:shadow-lg transition-shadow duration-200">
                {/* Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/50 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500">プレビュー</p>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {space.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {space.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>by {space.creator}</span>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {space.visitCount.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 capitalize">
                      {categories.find(cat => cat.id === space.category)?.icon} {categories.find(cat => cat.id === space.category)?.name}
                    </span>
                    <Link to={`/spaces/${space.id}/view`}>
                      <Button size="sm">
                        訪問する
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">空間が見つかりませんでした</h3>
            <p className="mt-1 text-sm text-gray-500">
              検索条件を変更して再度お試しください
            </p>
          </div>
        )}

        {/* Featured Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">注目のクリエイター</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['アーティストA', 'ミュージシャンB', 'ゲーマーD'].map((creator, index) => (
              <Card key={creator} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600">
                    {creator.charAt(creator.length - 1)}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{creator}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {index === 0 && '美しいアート作品を展示'}
                  {index === 1 && '心に響く音楽を配信'}
                  {index === 2 && '楽しいゲーム実況'}
                </p>
                <Button variant="outline" size="sm">
                  フォロー
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}; 