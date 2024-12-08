from typing import List, Optional
from pydantic import BaseModel

class Event(BaseModel):
    id: str
    event: str
    timestamp: str
    properties: dict

class User(BaseModel):
    id: str
    email: Optional[str]
    events: List[Event] = [] # Events associated with the user

class Group(BaseModel):
    id: str
    name: str
    users: List[User] = [] # Users in the group
