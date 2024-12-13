from pydantic import BaseModel

class S3(BaseModel):
    access_key_id: str
    secret_access_key: str
    region_name: str

    def get_credentials(self):
        return {
            "access_key_id": self.access_key_id,
            "secret_access_key": self.secret_access_key,
            "region_name": self.region_name,
            "bucket_name": self.bucket_name
        }
