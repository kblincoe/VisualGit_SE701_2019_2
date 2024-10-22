import * as nodegit from 'nodegit';
import Core from "./core";
import { logger } from 'logger';
export default class Commit {
    public constructor(git: Core, commit: nodegit.Commit) {
        this.git = git;
        this.commit = commit;
    }

    /**
     * Gets the id of this commit
     */
    public getId() {
        return this.commit.id();
    }

    /**
     * Gets the message of this commit
     */
    public getMessage() {
        return this.commit.message();
    }

    /**
     * Adds a tag to this commit with a specified name and message
     */
    public async addTag(name: string, message: string) {
        logger.info(`Adding tag ${name} to ${this.commit.id()}`);
        await this.git.repo.createTag(
            this.commit.id(),
            name,
            message
        );

        await this.git.refresh();
    }

    /**
     * Deletes a tag by name
     */
    public async removeTag(name: string) {
        logger.info(`Removing tag ${name}`);
        await this.git.repo.deleteTagByName(
                name
            );

        await this.git.refresh();
    }

    /**
     * Gets tags associated with this commit
     */
    public async getTags() {
        const allTags: string[] = await nodegit.Tag.list(this.git.repo);
        const associatedTags: string[] = [];

        for (const tagName of allTags) {
            const tag = await this.git.repo.getTagByName(tagName);
            if (tag.targetId().equal(this.commit.id())) {
                associatedTags.push(tagName);
            }
        }

        return associatedTags;
    }

    private git: Core;
    private commit: nodegit.Commit;
}
