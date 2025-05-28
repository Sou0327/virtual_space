import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../stores/authStore';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    displayName: '',
    password: '',
    confirmPassword: '',
    userType: 'fan' as 'influencer' | 'fan',
  });
  const [error, setError] = useState('');

  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.username || !formData.displayName || !formData.password) {
      setError('すべての項目を入力してください');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (formData.password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }

    try {
      await register({
        email: formData.email,
        username: formData.username,
        displayName: formData.displayName,
        password: formData.password,
        userType: formData.userType,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">FanVerse</span>
          </h1>
          <p className="text-gray-600">新しいアカウントを作成</p>
        </div>

        <Card variant="glass">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                アカウントタイプ
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="userType"
                    value="fan"
                    checked={formData.userType === 'fan'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm">ファン</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="userType"
                    value="influencer"
                    checked={formData.userType === 'influencer'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm">インフルエンサー</span>
                </label>
              </div>
            </div>

            <Input
              type="email"
              name="email"
              label="メールアドレス"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />

            <Input
              type="text"
              name="username"
              label="ユーザー名"
              value={formData.username}
              onChange={handleChange}
              placeholder="username"
              helperText="英数字とアンダースコアのみ使用可能"
              required
            />

            <Input
              type="text"
              name="displayName"
              label="表示名"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="表示される名前"
              required
            />

            <Input
              type="password"
              name="password"
              label="パスワード"
              value={formData.password}
              onChange={handleChange}
              placeholder="6文字以上"
              required
            />

            <Input
              type="password"
              name="confirmPassword"
              label="パスワード確認"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="パスワードを再入力"
              required
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              アカウントを作成
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              すでにアカウントをお持ちの方は{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                ログイン
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}; 