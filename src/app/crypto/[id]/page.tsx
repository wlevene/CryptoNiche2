import { notFound } from 'next/navigation';
import { CryptoDetailView } from '@/components/crypto/crypto-detail-view';

interface CryptoDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CryptoDetailPage({ params }: CryptoDetailPageProps) {
  const { id } = await params;
  const cryptoId = parseInt(id);
  
  if (isNaN(cryptoId)) {
    notFound();
  }

  return <CryptoDetailView cryptoId={cryptoId} />;
}

export async function generateMetadata({ params }: CryptoDetailPageProps) {
  const { id } = await params;
  const cryptoId = parseInt(id);
  
  if (isNaN(cryptoId)) {
    return {
      title: 'Cryptocurrency Not Found - CryptoNiche',
    };
  }

  // In a real app, you'd fetch the crypto name here for better SEO
  return {
    title: `Cryptocurrency Details - CryptoNiche`,
    description: `View detailed information, price history, and market data for this cryptocurrency`,
  };
}