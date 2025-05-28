import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { VirtualSpaceViewer } from '../components/VirtualSpaceViewer';
import { SpaceChat } from '../components/SpaceChat';
import { useSpaceStore } from '../stores/spaceStore';
import { useAuthStore } from '../stores/authStore';

export const SpaceViewPage: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const { currentSpace, fetchSpace, isLoading, error } = useSpaceStore();
  const { user } = useAuthStore();
  const [isOwner, setIsOwner] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);

  useEffect(() => {
    if (spaceId) {
      fetchSpace(spaceId);
    }
  }, [spaceId, fetchSpace]);

  useEffect(() => {
    if (currentSpace && user) {
      setIsOwner(currentSpace.userId === user.id);
    }
  }, [currentSpace, user]);

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4 text-lg">空間を読み込み中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !currentSpace) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">空間が見つかりません</h3>
            <p className="mt-1 text-sm text-gray-500">
              {error || '指定された空間は存在しないか、アクセス権限がありません。'}
            </p>
            <div className="mt-6">
              <Button onClick={() => navigate('/explore')}>
                空間を探索
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentSpace.title}</h1>
              <p className="text-lg text-gray-600">
                by {currentSpace.displayName || currentSpace.username}
              </p>
              {currentSpace.description && (
                <p className="text-gray-600 mt-2">{currentSpace.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {currentSpace.visitCount} 回訪問
              </div>
              {isOwner && (
                <Button variant="outline" onClick={() => navigate(`/spaces/${spaceId}/edit`)}>
                  編集
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 3D Viewer */}
        <Card className="mb-8 p-0 overflow-hidden">
          <div className="aspect-video">
            <VirtualSpaceViewer
              space={currentSpace}
              onEnterSpace={() => {
                console.log('空間に入りました:', currentSpace.title);
              }}
            />
          </div>
        </Card>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Space Info */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">空間について</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">テンプレート</span>
                  <span className="font-medium">{currentSpace.template.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">タイプ</span>
                  <span className="font-medium capitalize">{currentSpace.template.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">公開状態</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentSpace.isPublic
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}>
                    {currentSpace.isPublic ? '公開中' : '非公開'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">作成日</span>
                  <span className="font-medium">
                    {new Date(currentSpace.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>
            </Card>

            {/* Interactive Elements */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">インタラクティブ要素</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">チャット</h3>
                  <p className="text-sm text-gray-500">リアルタイム会話</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">リアクション</h3>
                  <p className="text-sm text-gray-500">感情表現</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Info */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">クリエイター</h2>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600">
                    {(currentSpace.displayName || currentSpace.username || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  {currentSpace.displayName || currentSpace.username}
                </h3>
                <p className="text-sm text-gray-500 mb-4">@{currentSpace.username}</p>
                {!isOwner && (
                  <Button variant="outline" size="sm" className="w-full">
                    フォロー
                  </Button>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">アクション</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  シェア
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  ブックマーク
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  応援する
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Chat Component */}
        <SpaceChat
          spaceId={spaceId || ''}
          isVisible={isChatVisible}
          onToggle={() => setIsChatVisible(!isChatVisible)}
        />
      </div>
    </Layout>
  );
}; 