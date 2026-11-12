-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('ADMIN', 'PROFESSOR', 'RESPONSAVEL');

-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN     "responsavelUsuarioId" INTEGER;

-- AlterTable
ALTER TABLE "Turma" ADD COLUMN     "professorId" INTEGER;

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_responsavelUsuarioId_fkey" FOREIGN KEY ("responsavelUsuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

