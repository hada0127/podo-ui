type AvatarType = 'image' | 'icon' | 'text';
type AvatarSize = 16 | 20 | 24 | 28 | 32 | 36 | 40 | 48 | 56;
interface Props {
    /**
     * Avatar type
     * - image: Display user uploaded image
     * - icon: Display system provided icon with background
     * - text: Display user name or initials with background
     */
    type?: AvatarType;
    /** Image source URL (for type='image') */
    src?: string;
    /** Icon class name (for type='icon') */
    icon?: string;
    /** Text content (for type='text') */
    text?: string;
    /** Avatar size in pixels */
    size?: AvatarSize;
    /** Show activity ring */
    activityRing?: boolean;
    /** Additional CSS class names */
    class?: string;
    /** Alt text for image */
    alt?: string;
    /** Click handler */
    onclick?: () => void;
}
type $$ComponentProps = Props & Record<string, unknown>;
declare const Avatar: import("svelte").Component<$$ComponentProps, {}, "">;
type Avatar = ReturnType<typeof Avatar>;
export default Avatar;
