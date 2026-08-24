import { permanentRedirect } from 'next/navigation';

/**
 * /fr on its own was a 404 while /zh served a full landing page — an asymmetry
 * a French visitor finds by simply guessing the mirror of the Chinese URL.
 * The French landing content already exists at the slug below, so send them
 * there permanently rather than invent a second French page to maintain.
 */
export default function FrenchIndex(): never {
  permanentRedirect('/fr/calculateur-salaire-net-quebec');
}
