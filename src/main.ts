import './styles/index.css';
import { Game } from './game';

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
const uiRoot = document.querySelector<HTMLElement>('#ui-root');
if (!canvas || !uiRoot) throw new Error('Maples bootstrap failed: required DOM roots are missing.');

const game = new Game(canvas, uiRoot);
game.start();
addEventListener('resize', () => game.resize(), { passive: true });

window.addEventListener('error', (event) => {
  console.error('[Maples]', event.error ?? event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Maples:promise]', event.reason);
});
