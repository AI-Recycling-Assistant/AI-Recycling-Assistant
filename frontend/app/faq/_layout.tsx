import { Stack } from 'expo-router';

export default function FaqLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="faq-main" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="faq-detail" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="faq-feedback" 
        options={{ 
          headerShown: false 
        }} 
      />
    </Stack>
  );
}