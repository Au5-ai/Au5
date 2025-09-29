from typing import Generic, TypeVar, Union
from pydantic import BaseModel

T = TypeVar("T")
E = TypeVar("E")

class Result(BaseModel, Generic[T, E]):
    success: bool
    data: Union[T, None] = None
    error: Union[E, None] = None

    @staticmethod
    def ok(data: T) -> "Result[T, None]":
        return Result(success=True, data=data)

    @staticmethod
    def fail(error: E) -> "Result[None, E]":
        return Result(success=False, error=error)