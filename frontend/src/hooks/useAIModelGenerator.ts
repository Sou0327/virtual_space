import { useState } from 'react';

interface GenerateProgress {
  percentage: number;
  stage: 'idle' | 'analyze' | 'generate' | 'process' | 'refine' | 'completed';
  message: string;
}

interface GeneratedModel {
  id: string;
  name: string;
  prompt?: string;
  type?: string;
  modelUrl: string;
  textureUrl?: string;
  createdAt: Date | string;
  aiService?: string;
  taskId?: string;
}

interface RoomObject {
  id: string;
  type: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  modelUrl?: string;
  generated?: boolean;
}

export const useAIModelGenerator = (
  getObjectHeight: (type: string) => number,
  addObjectToRoom: (object: RoomObject) => void,
  addGeneratedModel: (model: GeneratedModel) => void
) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState<GenerateProgress>({
    percentage: 0,
    stage: 'idle',
    message: ''
  });

  const BACKEND_URL = 'http://localhost:3001';

  const generateAIObject = async (prompt: string, aiService: string = 'meshy') => {
    try {
      setIsGenerating(true);
      let previewTaskId: string | null = null;
      let refineTaskId: string | null = null;
      
      // プログレスバーの初期化
      setGenerateProgress({
        percentage: 0,
        stage: 'analyze' as const,
        message: 'プロンプトを解析中...'
      });

      console.log('🤖 Meshy-5 2段階プロセス開始:', { prompt, aiService });

      // Stage 1: Preview Generation (ベースメッシュ生成)
      await new Promise(resolve => setTimeout(resolve, 800));
      setGenerateProgress({
        percentage: 10,
        stage: 'generate' as const,
        message: 'Stage 1/2: ベースメッシュを生成中...'
      });

      console.log('🎯 Stage 1: Preview (ベースメッシュ) 生成開始');
      const previewResponse = await fetch(`${BACKEND_URL}/api/ai/text-to-3d`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          art_style: 'realistic',
          mode: 'preview'
        })
      });

      if (!previewResponse.ok) {
        throw new Error(`Preview生成失敗: ${previewResponse.status}`);
      }

      const previewResult = await previewResponse.json();
      previewTaskId = previewResult.task_id;
      
      if (!previewTaskId) {
        throw new Error('Preview TaskIDが取得できませんでした');
      }

      console.log('✅ Preview Task ID取得:', previewTaskId);

      // Stage 1: Preview完了まで待機
      setGenerateProgress({
        percentage: 20,
        stage: 'process' as const,
        message: 'Stage 1/2: プレビューモデル生成中...'
      });

      let previewCompleted = false;
      let pollCount = 0;
      const maxPolls = 60; // 最大3分間

      while (!previewCompleted && pollCount < maxPolls) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log(`🔄 Preview ポーリング ${pollCount + 1}/${maxPolls}: ${previewTaskId}`);
        const statusResponse = await fetch(`${BACKEND_URL}/api/ai/text-to-3d/${previewTaskId}/status`);
        
        if (!statusResponse.ok) {
          console.error('❌ Preview Status check failed:', statusResponse.status);
          pollCount++;
          continue;
        }

        const statusResult = await statusResponse.json();
        console.log('📊 Preview Status:', statusResult.status, 'Progress:', statusResult.progress);

        if (statusResult.status === 'SUCCEEDED') {
          previewCompleted = true;
          console.log('✅ Preview Stage完了！');
          
          setGenerateProgress({
            percentage: 50,
            stage: 'refine' as const,
            message: 'Stage 2/2: テクスチャ生成開始...'
          });
          break;
        } else if (statusResult.status === 'FAILED') {
          throw new Error('Preview生成が失敗しました');
        }

        // プログレスバーの更新
        const previewProgress = Math.min(20 + (statusResult.progress || 0) * 0.3, 49);
        setGenerateProgress({
          percentage: previewProgress,
          stage: 'process' as const,
          message: `Stage 1/2: プレビューモデル生成中... (${statusResult.progress || 0}%)`
        });

        pollCount++;
      }

      if (!previewCompleted) {
        throw new Error('Preview生成がタイムアウトしました');
      }

      // Stage 2: Refine Generation (テクスチャ適用)
      console.log('🎨 Stage 2: Refine (テクスチャ) 生成開始');
      const refineResponse = await fetch(`${BACKEND_URL}/api/ai/text-to-3d`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          art_style: 'realistic',
          mode: 'refine',
          preview_task_id: previewTaskId
        })
      });

      if (!refineResponse.ok) {
        throw new Error(`Refine生成失敗: ${refineResponse.status}`);
      }

      const refineResult = await refineResponse.json();
      refineTaskId = refineResult.task_id;
      
      if (!refineTaskId) {
        throw new Error('Refine TaskIDが取得できませんでした');
      }

      console.log('✅ Refine Task ID取得:', refineTaskId);

      // Stage 2: Refine完了まで待機
      setGenerateProgress({
        percentage: 60,
        stage: 'refine' as const,
        message: 'Stage 2/2: テクスチャ適用中...'
      });

      let refineCompleted = false;
      pollCount = 0;

      while (!refineCompleted && pollCount < maxPolls) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log(`🔄 Refine ポーリング ${pollCount + 1}/${maxPolls}: ${refineTaskId}`);
        const statusResponse = await fetch(`${BACKEND_URL}/api/ai/text-to-3d/${refineTaskId}/status`);
        
        if (!statusResponse.ok) {
          console.error('❌ Refine Status check failed:', statusResponse.status);
          pollCount++;
          continue;
        }

        const statusResult = await statusResponse.json();
        console.log('📊 Refine Status:', statusResult.status, 'Progress:', statusResult.progress);

        if (statusResult.status === 'SUCCEEDED') {
          refineCompleted = true;
          console.log('✅ Refine Stage完了！');
          console.log('🔍 Refine完了時の詳細データ:', JSON.stringify(statusResult, null, 2));
          
          // 最終的なモデルURL取得
          const finalModelUrl = statusResult.model_urls?.glb || statusResult.model_urls?.obj || statusResult.model_urls?.fbx;
          const textureUrls = statusResult.texture_urls || [];
          
          console.log('📁 検出されたモデルURL:', {
            glb: statusResult.model_urls?.glb,
            obj: statusResult.model_urls?.obj, 
            fbx: statusResult.model_urls?.fbx,
            selected: finalModelUrl
          });
          console.log('🎨 検出されたテクスチャURL:', textureUrls);
          
          if (!finalModelUrl) {
            console.error('❌ モデルURL取得失敗 - レスポンス構造:', statusResult);
            
            // プロキシ経由でモデル取得を試行
            const proxyModelUrl = `${BACKEND_URL}/api/ai/proxy-model/${refineTaskId}`;
            console.log('🔄 プロキシ経由でモデル取得を試行:', proxyModelUrl);
            
            // プロキシが利用可能かチェック
            try {
              const proxyCheckResponse = await fetch(proxyModelUrl, { method: 'HEAD' });
              if (proxyCheckResponse.ok) {
                console.log('✅ プロキシモデルURL使用:', proxyModelUrl);
                
                // プロキシURLを使用してオブジェクト作成
                const height = getObjectHeight('custom');
                const newObject: RoomObject = {
                  id: Date.now().toString(),
                  type: 'generated',
                  name: prompt,
                  position: [0, height, 0],
                  rotation: [0, 0, 0],
                  scale: [1, 1, 1],
                  modelUrl: proxyModelUrl,
                  generated: true
                };

                addObjectToRoom(newObject);

                // 生成履歴に追加
                const newGeneratedModel: GeneratedModel = {
                  id: Date.now().toString(),
                  name: prompt,
                  prompt: prompt,
                  type: 'text-to-3d',
                  modelUrl: proxyModelUrl,
                  textureUrl: textureUrls[0]?.base_color,
                  createdAt: new Date(),
                  aiService: 'meshy-5',
                  taskId: refineTaskId
                };

                addGeneratedModel(newGeneratedModel);

                // 完了状態に更新
                setGenerateProgress({
                  percentage: 100,
                  stage: 'completed' as const,
                  message: '✅ プロキシ経由でモデル取得完了！'
                });

                console.log('🎯 プロキシ経由でオブジェクト追加完了');
                break;
              }
            } catch (proxyError) {
              console.error('❌ プロキシモデル取得も失敗:', proxyError);
            }
            
            throw new Error('最終的なモデルURLが取得できませんでした');
          }

          console.log('🎊 完全なテクスチャ付きモデル生成完了:', finalModelUrl);

          // 完了状態に更新
          setGenerateProgress({
            percentage: 100,
            stage: 'completed' as const,
            message: '✅ テクスチャ付き3Dモデル生成完了！'
          });

          // オブジェクトをシーンに追加
          const height = getObjectHeight('custom');
          const newObject: RoomObject = {
            id: Date.now().toString(),
            type: 'generated',
            name: prompt,
            position: [0, height, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            modelUrl: finalModelUrl,
            generated: true
          };

          addObjectToRoom(newObject);

          // 生成履歴に追加
          const newGeneratedModel: GeneratedModel = {
            id: Date.now().toString(),
            name: prompt,
            prompt: prompt,
            type: 'text-to-3d',
            modelUrl: finalModelUrl,
            textureUrl: textureUrls[0]?.base_color,
            createdAt: new Date(),
            aiService: 'meshy-5',
            taskId: refineTaskId
          };

          addGeneratedModel(newGeneratedModel);

          console.log('🎯 高品質テクスチャ付きオブジェクト追加完了');
          break;
          
        } else if (statusResult.status === 'FAILED') {
          throw new Error('Refine生成が失敗しました');
        }

        // プログレスバーの更新
        const refineProgress = Math.min(60 + (statusResult.progress || 0) * 0.4, 99);
        setGenerateProgress({
          percentage: refineProgress,
          stage: 'refine' as const,
          message: `Stage 2/2: テクスチャ適用中... (${statusResult.progress || 0}%)`
        });

        pollCount++;
      }

      if (!refineCompleted) {
        throw new Error('Refine生成がタイムアウトしました');
      }

    } catch (error) {
      console.error('❌ Meshy-5 2段階生成エラー:', error);
      
      // エラー時はフォールバック処理
      setGenerateProgress({
        percentage: 100,
        stage: 'completed' as const,
        message: '⚠️ フォールバックモードで生成完了'
      });

      // フォールバック: デフォルトモデル
      const height = getObjectHeight('custom');
      const fallbackObject: RoomObject = {
        id: Date.now().toString(),
        type: 'cube',
        name: `${prompt} (フォールバック)`,
        position: [0, height, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        generated: true
      };

      addObjectToRoom(fallbackObject);

      console.log('🔄 フォールバック処理完了');
    } finally {
      setIsGenerating(false);
      
      // プログレスバーを数秒後に非表示
      setTimeout(() => {
        setGenerateProgress({
          percentage: 0,
          stage: 'idle' as const,
          message: ''
        });
      }, 3000);
    }
  };

  return {
    isGenerating,
    generateProgress,
    generateAIObject
  };
};

export default useAIModelGenerator; 