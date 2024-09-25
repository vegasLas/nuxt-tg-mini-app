-- CreateTable
CREATE TABLE "Appointment" (
    "id" SERIAL NOT NULL,
    "time" TEXT NOT NULL,
    "booked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);
