from typing import Generic, TypeVar, Union
from pydantic import BaseModel

T = TypeVar("T")
E = TypeVar("E")

class Result(BaseModel, Generic[T, E]):
    status: int
    is_success: bool
    data: Union[T, None] = None
    error: Union[E, None] = None

    @staticmethod
    def success(data: T) -> "Result[T, None]":
        return Result(is_success=True, data=data, status=200)

    @staticmethod
    def failure(error: E, status: int = 400) -> "Result[None, E]":
        return Result(is_success=False, error=error, status=status)

    def is_failure(self) -> bool:
        return not self.is_success
