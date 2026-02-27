import { db } from './db';
import { Media } from '../domain/models';

export const MediaRepo = {
    async saveImage(id: string, blob: Blob, mime: string): Promise<Media> {
        const media: Media = {
            id,
            type: 'exercise',
            mime,
            blob,
            createdAt: Date.now()
        };
        await db.media.put(media);
        return media;
    },

    async getImage(id: string): Promise<Blob | undefined> {
        const media = await db.media.get(id);
        return media?.blob;
    },

    async deleteImage(id: string): Promise<void> {
        await db.media.delete(id);
    }
};
