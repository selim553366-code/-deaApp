import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Project } from '../types';
import { Loader2 } from 'lucide-react';

export function PublishedSite() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      if (!projectId) return;
      try {
        const docRef = doc(db, 'projects', projectId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as Project;
          if (data.isPublished) {
            setProject(data);
            // Record a page view
            try {
              await addDoc(collection(db, 'projects', projectId, 'pageViews'), {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
              });
            } catch (e) {
              console.error("Failed to record page view", e);
            }
          } else {
            setError('Bu proje henüz yayınlanmadı.');
          }
        } else {
          setError('Proje bulunamadı.');
        }
      } catch (err) {
        console.error(err);
        setError('Bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100 p-4">
        <h1 className="text-2xl font-bold mb-2">Hata</h1>
        <p className="text-zinc-400">{error}</p>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={project.code}
      className="w-full h-screen border-none bg-white"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      title={project.title || "Published Site"}
    />
  );
}
