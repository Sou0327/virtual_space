# 🤖 AI生成機能セットアップガイド

## 🔥 実際のAI生成を有効化する方法

現在はデモモードで動作していますが、APIキーを設定することで**実際のAI生成**が利用可能になります！

### 📋 対応AIサービス

| サービス | 機能 | コスト | 品質 |
|---------|------|--------|------|
| **OpenAI DALL-E 3** | テクスチャ生成 | $0.040/画像 | ⭐⭐⭐⭐⭐ |
| **Stability AI** | 画像・3D生成 | $0.02/画像 | ⭐⭐⭐⭐ |
| **Meshy AI** | 3Dモデル生成 | $0.20/モデル | ⭐⭐⭐ |
| **Kaedim3D** | 画像→3D変換 | $1.00/モデル | ⭐⭐⭐⭐ |

### 🚀 セットアップ手順

#### 1. APIキー取得

```bash
# OpenAI (推奨)
https://platform.openai.com/api-keys

# Stability AI (推奨)
https://platform.stability.ai/account/keys

# Meshy AI
https://www.meshy.ai/api

# Kaedim3D
https://www.kaedim3d.com/api
```

#### 2. 環境変数設定

```bash
# backend/.env ファイルを作成
cd backend
cp .env.example .env

# .env ファイルを編集
nano .env
```

```env
# 実際のAPIキーを設定
OPENAI_API_KEY=sk-proj-your-actual-openai-key-here
STABILITY_API_KEY=sk-your-actual-stability-key-here
MESHY_API_KEY=msy-your-actual-meshy-key-here
KAEDIM_API_KEY=kdm-your-actual-kaedim-key-here
```

#### 3. サーバー再起動

```bash
# バックエンドサーバーを再起動
cd backend
npm run dev
```

#### 4. 動作確認

```bash
# APIキー状態確認
curl http://localhost:3001/api/ai/api-keys/status

# 実際のAI生成テスト
# フロントエンドで「🤖 AI強化」ボタンをクリック
```

### 🎯 使用方法

1. **テクスチャ生成**: プロンプト入力 → 「🎨 テクスチャ生成」
2. **3Dモデル生成**: プロンプト入力 → 「🎯 3Dモデル生成」
3. **Text-to-3D**: プロンプト入力 → 「🚀 Text-to-3D生成」
4. **画像→3D**: 画像アップロード → 「🚀 画像→3D変換」

### 💡 推奨設定

**最小構成（無料で始める）:**
```env
STABILITY_API_KEY=sk-your-stability-key
```

**フル機能（最高品質）:**
```env
OPENAI_API_KEY=sk-your-openai-key
STABILITY_API_KEY=sk-your-stability-key
```

### 🔍 トラブルシューティング

#### APIキーが認識されない
```bash
# サーバーログを確認
🔑 API Keys status: { openai: true, stability: true, ... }
```

#### 生成が失敗する
```bash
# エラーログを確認
❌ DALL-E 3 API Error: { error: { message: "..." } }
```

#### モックモードから切り替わらない
```bash
# .env ファイルの確認
cat backend/.env

# サーバー再起動
pkill -f "ts-node" && cd backend && npm run dev
```

### 🎉 成功時のログ

```bash
🔥 Using REAL OpenAI DALL-E 3 API...
✅ REAL DALL-E 3 texture generated successfully!

🔥 Using REAL Stability AI API...
✅ REAL Stability AI texture generated successfully!
```

### 📊 コスト目安

- **テクスチャ生成**: $0.02-0.04/回
- **3Dモデル生成**: $0.20-1.00/回
- **Text-to-3D**: $0.06/回（画像生成+3D変換）

**月額予算例**: $10-50で十分な実験が可能

### 🔒 セキュリティ

- APIキーは`.env`ファイルに保存（Gitにコミットしない）
- サーバー側でAPIキー管理（フロントエンドに露出しない）
- レート制限・エラーハンドリング実装済み 