from app.shared.result import Result


class CreateCollectionError:
    
    @staticmethod
    def CollectionAlreadyExists() -> Result : return Result.failure("Collection already exists");
    
    @staticmethod
    def CreationFailed() -> Result : return Result.failure("Failed to create collection", 500);