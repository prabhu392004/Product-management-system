from rest_framework import serializers
class productserializer(serializers.Serializer):
    name=serializers.CharField()
    price=serializers.FloatField()
    quantity=serializers.IntegerField()
    brand=serializers.CharField()


    def validate_price(self,price):
        if price<0:
            raise serializers.ValidationError("Price must always be non_negative number")
        return price
    def vaildate_quantity(self,quantity):
        if quantity <0:
            raise serializers.ValidationError('Quantity must be a non-negative number')
        return quantity
        

