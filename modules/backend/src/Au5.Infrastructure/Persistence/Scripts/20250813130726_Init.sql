IF OBJECT_ID(N'[MigrationHistory]') IS NULL
BEGIN
    CREATE TABLE [MigrationHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK_MigrationHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [MigrationHistory]
    WHERE [MigrationId] = N'20250813130726_Init'
)
BEGIN
    CREATE TABLE [Reaction] (
        [Id] int NOT NULL IDENTITY,
        [Type] varchar(100) NOT NULL,
        [Emoji] nvarchar(10) NOT NULL,
        [ClassName] varchar(100) NOT NULL,
        [IsActive] bit NOT NULL,
        CONSTRAINT [PK_dbo_Reaction] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [MigrationHistory]
    WHERE [MigrationId] = N'20250813130726_Init'
)
BEGIN
    CREATE TABLE [SystemConfig] (
        [Id] uniqueidentifier NOT NULL,
        [OrganizationName] varchar(100) NOT NULL,
        [BotName] nvarchar(50) NOT NULL,
        [HubUrl] varchar(200) NOT NULL,
        [Direction] varchar(10) NOT NULL,
        [Language] varchar(5) NOT NULL,
        [ServiceBaseUrl] varchar(200) NOT NULL,
        [OpenAIToken] varchar(200) NOT NULL,
        [PanelUrl] varchar(200) NOT NULL,
        CONSTRAINT [PK_dbo_SystemConfig] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [MigrationHistory]
    WHERE [MigrationId] = N'20250813130726_Init'
)
BEGIN
    CREATE TABLE [User] (
        [Id] uniqueidentifier NOT NULL,
        [FullName] varchar(50) NOT NULL,
        [PictureUrl] varchar(250) NULL,
        [Email] varchar(75) NOT NULL,
        [Password] varchar(500) NOT NULL,
        [IsActive] bit NOT NULL,
        CONSTRAINT [PK_dbo_User] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [MigrationHistory]
    WHERE [MigrationId] = N'20250813130726_Init'
)
BEGIN
    CREATE TABLE [Meeting] (
        [Id] uniqueidentifier NOT NULL,
        [MeetId] varchar(200) NULL,
        [MeetName] nvarchar(200) NULL,
        [BotInviterUserId] uniqueidentifier NOT NULL,
        [HashToken] varchar(100) NULL,
        [Platform] varchar(20) NULL,
        [BotName] nvarchar(200) NULL,
        [IsBotAdded] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [Status] int NOT NULL,
        CONSTRAINT [PK_dbo_Meeting] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Meeting_User_BotInviterUserId] FOREIGN KEY ([BotInviterUserId]) REFERENCES [User] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [MigrationHistory]
    WHERE [MigrationId] = N'20250813130726_Init'
)
BEGIN
    CREATE TABLE [Entry] (
        [Id] int NOT NULL IDENTITY,
        [BlockId] uniqueidentifier NOT NULL,
        [ParticipantId] uniqueidentifier NOT NULL,
        [FullName] nvarchar(50) NULL,
        [Content] nvarchar(4000) NOT NULL,
        [Timestamp] datetime2 NOT NULL,
        [Timeline] varchar(8) NULL,
        [EntryType] nvarchar(10) NULL,
        [MeetingId] uniqueidentifier NULL,
        CONSTRAINT [PK_dbo_Entry] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Entry_Meeting_MeetingId] FOREIGN KEY ([MeetingId]) REFERENCES [Meeting] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [MigrationHistory]
    WHERE [MigrationId] = N'20250813130726_Init'
)
BEGIN
    CREATE TABLE [ParticipantInMeeting] (
        [Id] int NOT NULL IDENTITY,
        [MeetingId] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [FullName] nvarchar(50) NULL,
        [PictureUrl] varchar(200) NULL,
        CONSTRAINT [PK_dbo_ParticipantInMeeting] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ParticipantInMeeting_Meeting_MeetingId] FOREIGN KEY ([MeetingId]) REFERENCES [Meeting] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [MigrationHistory]
    WHERE [MigrationId] = N'20250813130726_Init'
)
BEGIN
    CREATE TABLE [AppliedReactions] (
        [Id] int NOT NULL IDENTITY,
        [EntryId] int NOT NULL,
        [ReactionId] int NOT NULL,
        [Participants] nvarchar(max) NULL,
        CONSTRAINT [PK_dbo_AppliedReactions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AppliedReactions_Entry_EntryId] FOREIGN KEY ([EntryId]) REFERENCES [Entry] ([Id]),
        CONSTRAINT [FK_AppliedReactions_Reaction_ReactionId] FOREIGN KEY ([ReactionId]) REFERENCES [Reaction] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [MigrationHistory]
    WHERE [MigrationId] = N'20250813130726_Init'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ClassName', N'Emoji', N'IsActive', N'Type') AND [object_id] = OBJECT_ID(N'[Reaction]'))
        SET IDENTITY_INSERT [Reaction] ON;
    EXEC(N'INSERT INTO [Reaction] ([Id], [ClassName], [Emoji], [IsActive], [Type])
    VALUES (1, ''reaction-task'', N''⚡'', CAST(0 AS bit), ''Task''),
    (2, ''reaction-important'', N''⭐'', CAST(0 AS bit), ''GoodPoint''),
    (3, ''reaction-question'', N''🎯'', CAST(0 AS bit), ''Goal'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ClassName', N'Emoji', N'IsActive', N'Type') AND [object_id] = OBJECT_ID(N'[Reaction]'))
        SET IDENTITY_INSERT [Reaction] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [MigrationHistory]
    WHERE [MigrationId] = N'20250813130726_Init'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Email', N'FullName', N'IsActive', N'Password', N'PictureUrl') AND [object_id] = OBJECT_ID(N'[User]'))
        SET IDENTITY_INSERT [User] ON;
    EXEC(N'INSERT INTO [User] ([Id], [Email], [FullName], [IsActive], [Password], [PictureUrl])
    VALUES (''edada1f7-cbda-4c13-8504-a57fe72d5960'', ''mha.karimi@gmail.com'', ''Mohammad Karimi'', CAST(1 AS bit), ''0PVQk0Qiwb8gY3iUipZQKhBQgDMJ/1PJfmIDhG5hbrA='', ''https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Email', N'FullName', N'IsActive', N'Password', N'PictureUrl') AND [object_id] = OBJECT_ID(N'[User]'))
        SET IDENTITY_INSERT [User] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [MigrationHistory]
    WHERE [MigrationId] = N'20250813130726_Init'
)
BEGIN
    CREATE INDEX [IX_AppliedReactions_EntryId] ON [AppliedReactions] ([EntryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [MigrationHistory]
    WHERE [MigrationId] = N'20250813130726_Init'
)
BEGIN
    CREATE INDEX [IX_AppliedReactions_ReactionId] ON [AppliedReactions] ([ReactionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [MigrationHistory]
    WHERE [MigrationId] = N'20250813130726_Init'
)
BEGIN
    CREATE INDEX [IX_Entry_MeetingId] ON [Entry] ([MeetingId]);
END;

IF NOT EXISTS (
    SELECT * FROM [MigrationHistory]
    WHERE [MigrationId] = N'20250813130726_Init'
)
BEGIN
    CREATE INDEX [IX_Meeting_BotInviterUserId] ON [Meeting] ([BotInviterUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [MigrationHistory]
    WHERE [MigrationId] = N'20250813130726_Init'
)
BEGIN
    CREATE INDEX [IX_ParticipantInMeeting_MeetingId] ON [ParticipantInMeeting] ([MeetingId]);
END;

IF NOT EXISTS (
    SELECT * FROM [MigrationHistory]
    WHERE [MigrationId] = N'20250813130726_Init'
)
BEGIN
    CREATE UNIQUE INDEX [IX_User_Email] ON [User] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [MigrationHistory]
    WHERE [MigrationId] = N'20250813130726_Init'
)
BEGIN
    INSERT INTO [MigrationHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20250813130726_Init', N'9.0.7');
END;

COMMIT;
GO

