import { z } from "zod";

export const socketIoGameDataSchema = z.object({
  gamePosition: z.string(),
  firstUserId: z.string(),
  secondUserId: z.string().optional(),
  chatMessages: z.array(
    z.object({
      fromUserId: z.string(),
      content: z.string(),
    })
  ),
});
export type SocketIoSessionDataSchema = z.infer<typeof socketIoGameDataSchema>;
