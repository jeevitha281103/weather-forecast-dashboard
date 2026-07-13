import { useState, useEffect, useRef, useMemo } from 'react';
import { getWeatherType } from '../utils/weatherHelpers';

function WeatherBackground({ type = 'clear', isDay = true, className = '' }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const lastTimeRef = useRef(0);

  const weatherType = useMemo(() => {
    if (['clear', 'clouds'].includes(type)) return 'clear';
    return type;
  }, [type]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };
    
    const initParticles = () => {
      particlesRef.current = [];
      const count = getParticleCount();
      
      for (let i = 0; i < count; i++) {
        particlesRef.current.push(createParticle());
      }
    };
    
    const getParticleCount = () => {
      switch (weatherType) {
        case 'rain': return 80;
        case 'drizzle': return 50;
        case 'thunderstorm': return 100;
        case 'snow': return 60;
        case 'mist': return 15;
        case 'wind': return 30;
        default: return 0;
      }
    };
    
    const createParticle = () => {
      const w = canvas.width;
      const h = canvas.height;
      
      switch (weatherType) {
        case 'rain':
        case 'drizzle':
        case 'thunderstorm':
          return {
            type: 'rain',
            x: Math.random() * w,
            y: Math.random() * h,
            length: Math.random() * (weatherType === 'thunderstorm' ? 25 : 15) + (weatherType === 'thunderstorm' ? 15 : 5),
            width: Math.random() * (weatherType === 'thunderstorm' ? 2 : 1) + 0.5,
            speed: Math.random() * 10 + 15,
            opacity: Math.random() * 0.5 + 0.3,
          };
        case 'snow':
          return {
            type: 'snow',
            x: Math.random() * w,
            y: Math.random() * h,
            radius: Math.random() * 3 + 1,
            speedY: Math.random() * 1 + 0.5,
            speedX: (Math.random() - 0.5) * 0.5,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            opacity: Math.random() * 0.5 + 0.5,
          };
        case 'mist':
        case 'fog':
          return {
            type: 'mist',
            x: Math.random() * w,
            y: Math.random() * h * 0.8,
            radius: Math.random() * 100 + 50,
            speedX: (Math.random() - 0.5) * 0.2,
            opacity: Math.random() * 0.1 + 0.05,
          };
        case 'wind':
          return {
            type: 'wind',
            x: Math.random() * w,
            y: Math.random() * h,
            length: Math.random() * 100 + 50,
            width: Math.random() * 2 + 1,
            speed: Math.random() * 3 + 2,
            angle: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.3 + 0.1,
          };
        default:
          return { type: 'none' };
      }
    };
    
    const animate = (time) => {
      if (!ctx) return;
      
      const deltaTime = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach(particle => {
        updateParticle(particle, deltaTime, canvas.width, canvas.height);
        drawParticle(ctx, particle);
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    const updateParticle = (particle, dt, w, h) => {
      switch (particle.type) {
        case 'rain':
          particle.y += particle.speed * dt * 60;
          if (particle.y > h) {
            particle.y = -particle.length;
            particle.x = Math.random() * w;
          }
          break;
        case 'snow':
          particle.y += particle.speedY * dt * 60;
          particle.x += particle.speedX * dt * 60;
          particle.rotation += particle.rotationSpeed * dt * 60;
          if (particle.y > h) {
            particle.y = -10;
            particle.x = Math.random() * w;
          }
          if (particle.x > w) particle.x = 0;
          if (particle.x < 0) particle.x = w;
          break;
        case 'mist':
          particle.x += particle.speedX * dt * 60;
          if (particle.x > w + particle.radius) particle.x = -particle.radius;
          if (particle.x < -particle.radius) particle.x = w + particle.radius;
          break;
        case 'wind':
          particle.x += particle.speed * Math.cos(particle.angle) * dt * 60;
          particle.y += particle.speed * Math.sin(particle.angle) * dt * 60;
          if (particle.x > w) particle.x = 0;
          if (particle.x < 0) particle.x = w;
          if (particle.y > h) particle.y = 0;
          if (particle.y < 0) particle.y = h;
          break;
      }
    };
    
    const drawParticle = (ctx, particle) => {
      ctx.save();
      ctx.globalAlpha = particle.opacity;
      
      switch (particle.type) {
        case 'rain':
          ctx.strokeStyle = `rgba(174, 194, 224, ${particle.opacity})`;
          ctx.lineWidth = particle.width;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x, particle.y + particle.length);
          ctx.stroke();
          break;
        case 'snow':
          ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
          ctx.translate(particle.x, particle.y);
          ctx.rotate(particle.rotation);
          ctx.beginPath();
          ctx.arc(0, 0, particle.radius, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'mist':
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.radius
          );
          gradient.addColorStop(0, `rgba(200, 210, 220, ${particle.opacity})`);
          gradient.addColorStop(1, 'rgba(200, 210, 220, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'wind':
          ctx.strokeStyle = `rgba(148, 163, 184, ${particle.opacity})`;
          ctx.lineWidth = particle.width;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(
            particle.x - particle.length * Math.cos(particle.angle),
            particle.y - particle.length * Math.sin(particle.angle)
          );
          ctx.stroke();
          break;
      }
      ctx.restore();
    };
    
    if (weatherType !== 'clear' && weatherType !== 'clouds') {
      resize();
      window.addEventListener('resize', resize);
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [weatherType]);
  
  if (weatherType === 'clear' || weatherType === 'clouds') {
    return null;
  }
  
  return (
    <canvas
      ref={canvasRef}
      className={`weather-canvas ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
      }}
      aria-hidden="true"
    />
  );
}

export default WeatherBackground;
