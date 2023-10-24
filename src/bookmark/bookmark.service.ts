import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async getBookmarks(userId: string) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });
    const bookmarksWithoutUserId = bookmarks.map(({ userId: _, ...bookmark }) => bookmark);

    return bookmarksWithoutUserId;
  }

  async getBookmarkById(userId: string, bookmarkId: string) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
        userId,
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }
    const { userId: _, ...bookmarkWithoutUserId } = bookmark;

    return bookmarkWithoutUserId;
  }

  async createBookmark(userId: string, dto: CreateBookmarkDto) {
    const foundBookmark = await this.prisma.bookmark.findUnique({
      where: {
        userId,
        title: dto.title,
      },
    });

    if (foundBookmark) {
      throw new ConflictException(
        'You already have a bookmark with this title, choose a different one.',
      );
    }

    const { userId: _, ...createdBookmark } = await this.prisma.bookmark.create({
      data: {
        ...dto,
        userId,
      },
    });
    return createdBookmark;
  }

  async editBookmark(userId: string, bookmarkId: string, dto: EditBookmarkDto) {
    const foundBookmark = await this.prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    if (!foundBookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    if (foundBookmark.userId !== userId) {
      throw new ForbiddenException('Access to resources denied');
    }

    const { userId: _, ...updatedBookmark } = await this.prisma.bookmark.update({
      where: { id: bookmarkId },
      data: { ...dto },
    });

    return updatedBookmark;
  }

  async deleteBookmark(userId: string, bookmarkId: string) {
    const foundBookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });
    if (!foundBookmark) {
      throw new NotFoundException('Bookmark not found');
    }
    if (!foundBookmark || foundBookmark.userId !== userId) {
      throw new ForbiddenException('Access to resources denied');
    }

    const { userId: _, ...deletedBookmark } = await this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });

    return deletedBookmark;
  }
}
