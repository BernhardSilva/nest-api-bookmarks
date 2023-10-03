import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';

@Controller('bookmarks')
export class BookmarkController {
  @Post()
  create() {}

  @Get()
  findAll() {}

  @Get()
  findById() {}

  @Put('/:id')
  update() {}

  @Delete('/:id')
  delete() {}
}
