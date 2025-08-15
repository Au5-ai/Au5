"use client";

import { ColumnDef } from "@tanstack/react-table";

export type Meeting = {
  meetingId: string;
  meetId: string;
  meetName: string;
  platform: string;
  botName: string;
  createdAtDate: string;
  createdAtTime: string;
  status: string;
  duration: string;
  guests: {
    id: string;
    fullName: string;
    pictureUrl: string;
    email: string | null;
    hasAccount: boolean;
  }[];
  participants: {
    id: string;
    fullName: string;
    pictureUrl: string;
    email: string | null;
    hasAccount: boolean;
  }[];
};

export const columns: ColumnDef<Meeting>[] = [
  {
    accessorKey: "meetName",
    header: "Meet Name",
  },
  {
    accessorKey: "meetId",
    header: "Meet ID",
  },
  {
    accessorKey: "platform",
    header: "Platform",
  },
  {
    accessorKey: "createdAtDate",
    header: "Created At Date",
  },
  {
    accessorKey: "createdAtTime",
    header: "Created At Time",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "duration",
    header: "Duration",
  },
];
