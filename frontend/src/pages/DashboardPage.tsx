import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';
import { useSpaceStore } from '../stores/spaceStore';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { spaces, fetchMySpaces, isLoading } = useSpaceStore();

  useEffect(() => {
    if (user?.userType === 'influencer') {
      fetchMySpaces();
    }
  }, [user, fetchMySpaces]);

  const isInfluencer = user?.userType === 'influencer';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ようこそ、{user?.displayName}さん！
        </h1>
        <p className="text-lg text-gray-600">
          {isInfluencer
            ? 'あなたのバーチャル空間を管理し、ファンとの素晴らしい体験を作りましょう。'
            : 'お気に入りのインフルエンサーの空間を探索し、新しい発見を楽しみましょう。'
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {isInfluencer ? (
          <>
            <Card variant="glass">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">作成した空間</p>
                  <p className="text-2xl font-bold text-gray-900">{spaces.length}</p>
                </div>
              </div>
            </Card>

            <Card variant="glass">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">総訪問者数</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {spaces.reduce((total, space) => total + space.visitCount, 0)}
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="glass">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">公開中の空間</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {spaces.filter(space => space.isPublic).length}
                  </p>
                </div>
              </div>
            </Card>
          </>
        ) : (
          <>
            <Card variant="glass">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">新しい空間を</p>
                  <p className="text-lg font-bold text-gray-900">探索しよう</p>
                </div>
              </div>
            </Card>

            <Card variant="glass">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">お気に入りの</p>
                  <p className="text-lg font-bold text-gray-900">空間を見つけよう</p>
                </div>
              </div>
            </Card>

            <Card variant="glass">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">コミュニティと</p>
                  <p className="text-lg font-bold text-gray-900">つながろう</p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isInfluencer ? (
          <>
            {/* My Spaces */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">マイ空間</h2>
                <Link to="/create">
                  <Button size="sm">新しい空間を作成</Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">読み込み中...</p>
                </div>
              ) : spaces.length > 0 ? (
                <div className="space-y-3">
                  {spaces.slice(0, 3).map((space) => (
                    <div key={space.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{space.title}</h3>
                        <p className="text-sm text-gray-500">
                          {space.visitCount} 回訪問 • {space.isPublic ? '公開中' : '非公開'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Link to={`/space/${space.id}`}>
                          <Button variant="outline" size="sm">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            表示
                          </Button>
                        </Link>
                        <Link to={`/room-builder?spaceId=${space.id}`}>
                          <Button size="sm">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            AI編集
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {spaces.length > 3 && (
                    <Link to="/spaces" className="block text-center text-primary-600 hover:text-primary-700 text-sm font-medium">
                      すべての空間を見る
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">空間がありません</h3>
                  <p className="mt-1 text-sm text-gray-500">最初の空間を作成して始めましょう。</p>
                  <div className="mt-6">
                    <Link to="/create">
                      <Button>空間を作成</Button>
                    </Link>
                  </div>
                </div>
              )}
            </Card>

            {/* Quick Tips */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">クイックヒント</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-600">1</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">空間を作成</h3>
                    <p className="text-sm text-gray-500">テンプレートを選んで、あなただけの空間を作りましょう。</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-600">2</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">コンテンツを追加</h3>
                    <p className="text-sm text-gray-500">画像やテキストを配置して、空間を魅力的にしましょう。</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-600">3</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">ファンと交流</h3>
                    <p className="text-sm text-gray-500">空間を公開して、ファンとの交流を楽しみましょう。</p>
                  </div>
                </div>
              </div>
            </Card>
          </>
        ) : (
          <>
            {/* Explore Spaces */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">人気の空間</h2>
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">新しい空間を発見</h3>
                <p className="mt-1 text-sm text-gray-500">インフルエンサーが作成した素晴らしい空間を探索しましょう。</p>
                <div className="mt-6">
                  <Link to="/explore">
                    <Button>空間を探索</Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Getting Started */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">はじめ方</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-600">1</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">空間を探索</h3>
                    <p className="text-sm text-gray-500">お気に入りのインフルエンサーの空間を見つけましょう。</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-600">2</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">交流を楽しむ</h3>
                    <p className="text-sm text-gray-500">チャットやリアクションで交流しましょう。</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-600">3</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">応援する</h3>
                    <p className="text-sm text-gray-500">応援アイテムでお気に入りのクリエイターを支援しましょう。</p>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}; 