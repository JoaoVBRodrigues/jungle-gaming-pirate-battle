import './GameTutorial.css';

type TutorialSide = 'left' | 'right';

const controlAssets = {
    forward: new URL(
        '../../../assets/png/default/ui/controls/icon_forward.png',
        import.meta.url,
    ).href,
    turnLeft: new URL(
        '../../../assets/png/default/ui/controls/icon_turn_left.png',
        import.meta.url,
    ).href,
    turnRight: new URL(
        '../../../assets/png/default/ui/controls/icon_turn_right.png',
        import.meta.url,
    ).href,
    fireFront: new URL(
        '../../../assets/png/default/ui/controls/icon_fire_front.png',
        import.meta.url,
    ).href,
    fireLeft: new URL(
        '../../../assets/png/default/ui/controls/icon_fire_left.png',
        import.meta.url,
    ).href,
    fireRight: new URL(
        '../../../assets/png/default/ui/controls/icon_fire_right.png',
        import.meta.url,
    ).href,
    pause: new URL(
        '../../../assets/png/default/ui/controls/icon_pause.png',
        import.meta.url,
    ).href,
} as const;

interface GameTutorialProps {
    side: TutorialSide;
}

interface TutorialItem {
    readonly icon: string;
    readonly label: string;
    readonly key: string;
}

const movementItems: readonly TutorialItem[] = [
    { icon: controlAssets.forward, label: 'Forward', key: 'W / Up' },
    { icon: controlAssets.turnLeft, label: 'Turn Left', key: 'A / Left' },
    { icon: controlAssets.turnRight, label: 'Turn Right', key: 'D / Right' },
];

const attackItems: readonly TutorialItem[] = [
    { icon: controlAssets.fireFront, label: 'Front Fire', key: 'Space' },
    { icon: controlAssets.fireLeft, label: 'Left Fire', key: 'Q' },
    { icon: controlAssets.fireRight, label: 'Right Fire', key: 'E' },
    { icon: controlAssets.pause, label: 'Pause', key: 'Esc' },
];

export function GameTutorial({ side }: GameTutorialProps) {
    const items = side === 'left' ? movementItems : attackItems;

    return (
        <aside
            className={`game-tutorial game-tutorial--${side}`}
            aria-label={side === 'left' ? 'Movement controls' : 'Attack controls'}
        >
            <p className="game-tutorial__eyebrow">{side === 'left' ? 'Sail' : 'Battle'}</p>
            <h2>{side === 'left' ? 'Move' : 'Attack'}</h2>
            <div className="game-tutorial__items">
                {items.map((item) => (
                    <div className="game-tutorial__item" key={item.label}>
                        <img src={item.icon} alt="" aria-hidden="true" />
                        <span>
                            <strong>{item.label}</strong>
                            <small>{item.key}</small>
                        </span>
                    </div>
                ))}
            </div>
        </aside>
    );
}
