USE [Au5]
GO

DELETE FROM [dbo].[GuestsInMeeting];
DELETE FROM [dbo].[ParticipantInMeeting];
DELETE FROM  [dbo].[Entry];
DELETE FROM [dbo].[Meeting];

Declare @EmptyGuid uniqueidentifier = '00000000-0000-0000-0000-000000000000';
DECLARE @userId UNIQUEIDENTIFIER = '08168E03-E466-4886-8946-7B62AE715FA3'; -- Change With your ID
DECLARE @meetingId_one UNIQUEIDENTIFIER = NEWID();
DECLARE @meetingId_two UNIQUEIDENTIFIER = NEWID();
DECLARE @meetingId_three UNIQUEIDENTIFIER = NEWID();

INSERT INTO [dbo].[Meeting]
           ([Id]
           ,[MeetId]
           ,[MeetName]
           ,[BotInviterUserId]
		   ,[ClosedMeetingUserId]
           ,[HashToken]
           ,[Platform]
           ,[BotName]
           ,[IsBotAdded]
           ,[CreatedAt]
		   ,[ClosedAt]
           ,[Duration]
           ,[Status]
		   ,IsFavorite
		   )
     VALUES
           (@meetingId_one,
		   'ijk-lkdj-ipk',
		   'Automation Meeting',
		    @userId,
			@userId,
		   'adljkadkjlnl92345kj2l5n235nlks2ol5j2l52nl5',
		   'Google Meet',
		   'Cando',
		   1,
		   '2025-07-14 11:41:44',
		   '2025-07-14 13:41:44',
		   '1h 35m',
		   30,
		   1),
           (@meetingId_two,
		   'sfc-tthd-nnf',
		   '1:1 With Nil',
		   @userId,
		   @userId,
		   'adfdasvaate35sgaadfadfewgegwertgeqgqekjpjpjio',
		   'Google Meet',
		   'Cando',
		   1,
		   '2025-07-14 10:09:02',
		   '2025-07-14 11:09:02',
		   '1h 35m',
		   30,
		   0),
           (@meetingId_three,
		   'kmu-werq-aww',
		   'Integration Testing With Team',
		   @userId,
		   @userId,
		   'lskadjflasdkjfadskfjklajlfkjalsdfjlwkeafd',
		   'Google Meet',
		   'Cando',
		   1,
		   '2025-07-13  15:23:22',
		   '2025-07-13 16:09:02',
		   '1h 35m',
		   30,
		   0);
INSERT INTO [dbo].[ParticipantInMeeting]
           ([MeetingId]
           ,[UserId])
     VALUES
           (@meetingId_one
           ,@userId),
           (@meetingId_two
           ,@userId),
           (@meetingId_three
           ,@userId);
INSERT INTO [dbo].[GuestsInMeeting]
           ([MeetingId]
           ,[FullName]
           ,[PictureUrl])
     VALUES
           (@meetingId_one
           ,'Mehran N'
           ,'https://i.pinimg.com/75x75_RS/41/d9/3b/41d93be8d53146cb3bc0a9a794857753.jpg'),
           (@meetingId_one
           ,'Mohammad Reza'
           ,'https://i.pinimg.com/75x75_RS/41/d9/3b/41d93be8d53146cb3bc0a9a794857753.jpg'),
           (@meetingId_two
           ,'Alireza'
           ,'https://i.pinimg.com/75x75_RS/41/d9/3b/41d93be8d53146cb3bc0a9a794857753.jpg'),
           (@meetingId_two
           ,'Nima'
           ,'https://i.pinimg.com/75x75_RS/41/d9/3b/41d93be8d53146cb3bc0a9a794857753.jpg'),
           (@meetingId_two
           ,'Mehdi'
           ,'https://i.pinimg.com/75x75_RS/41/d9/3b/41d93be8d53146cb3bc0a9a794857753.jpg'),
           (@meetingId_three
           ,'Reza'
           ,'https://i.pinimg.com/75x75_RS/41/d9/3b/41d93be8d53146cb3bc0a9a794857753.jpg');
INSERT INTO [dbo].[Entry]
           ([BlockId]
           ,[ParticipantId]
           ,[FullName]
           ,[Content]
           ,[Timestamp]
           ,[Timeline]
           ,[EntryType]
           ,[MeetingId])
VALUES
-- Meeting 1
(NEWID(), @userId, N'John Smith', N'Hello everyone, can you all hear me clearly?', '2025-07-14 11:43:44', '00:03:21', 'Transcription', @meetingId_one),
(NEWID(), @EmptyGuid, N'Mehran N', N'Yes John, loud and clear. How are you today?', '2025-07-14 11:43:52', '00:03:29', 'Transcription', @meetingId_one),
(NEWID(), @EmptyGuid, N'Mohammad Reza', N'I’m doing well, thanks. Let’s start with the project updates.', '2025-07-14 11:44:05', '00:03:42', 'Transcription', @meetingId_one),
(NEWID(), @EmptyGuid, N'Mehran N', N'Sure, I completed the new API integration yesterday.', '2025-07-14 11:44:18', '00:03:55', 'Transcription', @meetingId_one),
(NEWID(), @userId, N'John Smith', N'That’s great, Mark. Emily, how’s the design phase going?', '2025-07-14 11:44:33', '00:04:10', 'Transcription', @meetingId_one),

-- Meeting 2
(NEWID(), @userId, '', N'Good morning team, let’s review yesterday’s work.', '2025-07-15 09:00:12', '00:00:05', 'Transcription', @meetingId_two),
(NEWID(), @EmptyGuid, N'Alireza', N'I completed the database migration last night.', '2025-07-15 09:00:24', '00:00:17', 'Transcription', @meetingId_two),
(NEWID(), @EmptyGuid, N'Nima', N'Great, that should unblock the frontend work.', '2025-07-15 09:00:35', '00:00:28', 'Chat', @meetingId_two),
(NEWID(), @EmptyGuid, N'Mehdi', N'Yes, I can now connect and fetch data without errors.', '2025-07-15 09:00:50', '00:00:43', 'Transcription', @meetingId_two),
(NEWID(), @userId, '', N'Perfect, let’s aim to push the staging build by EOD.', '2025-07-15 09:01:10', '00:01:03', 'Chat', @meetingId_two),

-- Meeting 3
(NEWID(), @userId, '', N'Hey Reza, did you manage to fix the deployment issue?', '2025-07-16 14:15:02', '00:02:10', 'Transcription', @meetingId_three),
(NEWID(), @EmptyGuid, N'Reza', N'Yes, it was due to a missing environment variable.', '2025-07-16 14:15:15', '00:02:23', 'Transcription', @meetingId_three),
(NEWID(), @userId, '', N'Great, we should update the deployment docs.', '2025-07-16 14:15:28', '00:02:36', 'Transcription', @meetingId_three),
(NEWID(), @EmptyGuid, N'Reza', N'I already added it to the team wiki.', '2025-07-16 14:15:40', '00:02:48', 'Transcription', @meetingId_three),
(NEWID(), @userId, '', N'Perfect. Then we’re ready for the release tomorrow.', '2025-07-16 14:15:52', '00:03:00', 'Chat', @meetingId_three);
