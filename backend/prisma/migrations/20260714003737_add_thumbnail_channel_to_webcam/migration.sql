/*
  Warnings:

  - You are about to drop the column `latitude` on the `webcams` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `webcams` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "webcams" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "channel" TEXT,
ADD COLUMN     "thumbnail" TEXT;
