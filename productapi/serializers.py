from rest_framework import serializers
from .models import Product
class productserializer(serializers.ModelSerializer):


   class Meta:
    model=Product
    fields=['id','name','price','quantity','brand']
    read_only_fields=['id']



    def validate_price(self,price):
        if price<0:
            raise serializers.ValidationError("Price must always be non_negative number")
        return price
    def vaildate_quantity(self,quantity):
        if quantity <0:
            raise serializers.ValidationError('Quantity must be a non-negative number')
        return quantity
        

