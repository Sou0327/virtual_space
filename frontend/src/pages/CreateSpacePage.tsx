import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useSpaceStore } from '../stores/spaceStore';
import type { SpaceTemplate } from '../types';

export const CreateSpacePage: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    templateId: '',
  });
  const [error, setError] = useState('');

  const { templates, fetchTemplates, createSpace, isLoading } = useSpaceStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    setFormData({
      ...formData,
      templateId,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.templateId) {
      setError('タイトルとテンプレートを選択してください');
      return;
    }

    try {
      const spaceId = await createSpace(formData);
      navigate(`/room-builder?spaceId=${spaceId}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">新しい空間を作成</h1>
          <p className="text-lg text-gray-600">
            テンプレートを選んで、AIルームビルダーであなただけのバーチャル空間を作りましょう
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-800">AI搭載ルームビルダー</h3>
                <p className="text-sm text-blue-700 mt-1">
                  スペース作成後、AIルームビルダーで自然言語を使って家具やインテリアを自由にカスタマイズできます。「木のテーブルを置いて」「壁を青色にして」などと話しかけるだけ！
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">基本情報</h2>
            <div className="space-y-4">
              <Input
                name="title"
                label="空間名"
                value={formData.title}
                onChange={handleChange}
                placeholder="例: マイルーム、ライブステージ"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  説明（任意）
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="この空間について簡単に説明してください"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </Card>

          {/* Template Selection */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">テンプレートを選択</h2>
            {templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template: SpaceTemplate) => (
                  <div
                    key={template.id}
                    className={`relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg ${formData.templateId === template.id
                      ? 'border-primary-500 bg-primary-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-primary-300'
                      }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    {/* Preview Image */}
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={template.preview}
                        alt={template.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        onError={(e) => {
                          // Fallback to gradient if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      {/* Fallback gradient */}
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center"
                        style={{ display: 'none' }}
                      >
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white/50 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            {template.type === 'room' && (
                              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                              </svg>
                            )}
                            {template.type === 'stage' && (
                              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10" />
                              </svg>
                            )}
                            {template.type === 'gallery' && (
                              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                              </svg>
                            )}
                            {template.type === 'outdoor' && (
                              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646" />
                              </svg>
                            )}
                            {template.type === 'futuristic' && (
                              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            )}
                            {template.type === 'social' && (
                              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857" />
                              </svg>
                            )}
                            {template.type === 'custom' && (
                              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">プレビュー</p>
                        </div>
                      </div>

                      {/* Selection indicator */}
                      {formData.templateId === template.id && (
                        <div className="absolute top-3 right-3">
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                      {template.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                      )}

                      {/* Features */}
                      {template.features && template.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {template.features.slice(0, 3).map((feature, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              {feature}
                            </span>
                          ))}
                          {template.features.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              +{template.features.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-gray-500 capitalize font-medium">{template.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-500 mt-4 text-lg">テンプレートを読み込み中...</p>
              </div>
            )}
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading || !formData.title || !formData.templateId}
            >
              空間を作成してカスタマイズ
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}; 