import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBatchCrud } from '@/hooks/useBatchCrud';
import { Batch } from '@/types/batch';
import { Music, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SongGenerationTest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleCreateBatch } = useBatchCrud();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const defaultSongPrompt = `Imagine yourself as a renowned singer-songwriter, celebrated for crafting melodies and lyrics that resonate deeply with audiences. You blend wisdom from the greats with your unique flair, creating songs that are not just heard but felt. Every lyric is authentic, heartfelt, and brimming with emotional power, connecting with listeners on a profound level. Your writing process is an immersive journey, balancing raw creativity with clever craftsmanship to produce songs that captivate and inspire.

Objective: Craft a Billboard Top 10 hit that combines profound storytelling, lyrical depth, and maximum social media engagement.

Step-by-Step Instructions:

Step 1: Topic Selection
Choose a compelling theme, such as an emotion, experience, or narrative. Use the provided subject matter: no one will even notice or care and no one should be sad when I finally embark

Step 2: Artist Inspiration
Draw inspiration from the following artist and study their style, production techniques, and lyrical themes to influence your composition: Elton John

Step 3: Lyrics Creation
Write lyrics that maximize perplexity and creativity while remaining engaging and coherent. Please add [Instrumental] and either [Vocalizing] or [Harmonizing] EXAMPLE: [Instrumental] [Vocalizing] or [Instrumental] [Harmonizing] after all verses and choruses, and strategically place a [Drop] for maximum impact.

Compose only the following sections with the requested [Instrumental] and [Vocalizing] or [Harmonizing] after every verse and chorus and write original [Song Title],[Verse 1],[Hook],[Verse 2],[Hook],[Bridge],[Hook]. Verses should be 16 bars.

Step 4: Song Description for AI Music Generation
Provide a concise, vivid description of the track's mood and genre. Example: "An emotional ballad blending ethereal synths with trap beats, building to an explosive, anthemic chorus."

Step 5: Image Prompt for Cover Art
Describe the essence of the song in visual terms. Example: "A lone figure walking through a neon-lit city under a stormy sky."`;

  const [targetUrl, setTargetUrl] = useState('https://udio.com');
  const [songPrompt, setSongPrompt] = useState(defaultSongPrompt);
  const [batchName, setBatchName] = useState('Song Generation - Elton John Style');

  const handleCreateSongBatch = async () => {
    setIsCreating(true);
    try {
      const batchData = {
        name: batchName,
        targetUrl: targetUrl,
        description: 'AI Music Generation Test - Billboard Top 10 Hit',
        status: 'draft' as const,
        prompts: [
          {
            id: crypto.randomUUID(),
            text: songPrompt,
            order: 1
          }
        ],
        settings: {
          waitForIdle: true,
          maxRetries: 3
        }
      };

      await handleCreateBatch(batchData, setBatches);
      
      toast({
        title: 'Batch Created!',
        description: 'Navigating to Dashboard to run your song generation batch...',
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Failed to create batch:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Music className="h-6 w-6" />
              AI Music Generation Test
            </CardTitle>
            <CardDescription className="text-gray-300">
              Test batch automation with Udio.com for AI music generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="batchName" className="text-white">Batch Name</Label>
              <Input
                id="batchName"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetUrl" className="text-white">Target URL</Label>
              <Input
                id="targetUrl"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="songPrompt" className="text-white">Song Generation Prompt</Label>
              <Textarea
                id="songPrompt"
                value={songPrompt}
                onChange={(e) => setSongPrompt(e.target.value)}
                className="bg-white/10 border-white/20 text-white min-h-[400px]"
              />
            </div>

            <Button
              onClick={handleCreateSongBatch}
              disabled={isCreating}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              {isCreating ? 'Creating Batch...' : 'Create & Run Song Generation Batch'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SongGenerationTest;
