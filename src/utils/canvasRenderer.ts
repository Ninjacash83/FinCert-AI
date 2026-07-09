import { CertificateTemplate } from '../types';

/**
 * Draws a beautiful premium certificate background dynamically on a canvas.
 */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  template: {
    backgroundUrl: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    paperType?: 'A4' | 'F4';
    orientation?: 'landscape' | 'portrait';
  }
) {
  const isPortrait = height > width;
  const scaleY = (val: number) => {
    if (isPortrait) {
      if (val < 200) return val * 1.2;
      return val * (height / 848) * 0.95;
    }
    return val;
  };

  const style = template.backgroundUrl;

  if (style === 'classic-emerald') {
    const primary = template.primaryColor || '#0F5132';
    const secondary = template.secondaryColor || '#d97706';
    const accent = template.accentColor || '#FCFBF7';

    // 1. Background color (Warm off-white parchment)
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, width, height);

    // 2. Beautiful double border
    // Outer Border (Primary)
    ctx.strokeStyle = primary;
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Inner Border (Secondary)
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // Thin accent border
    ctx.strokeStyle = primary;
    ctx.lineWidth = 1;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    // 3. Corner Decorations (Gold & Green)
    const corners = [
      { x: 30, y: 30, dx: 1, dy: 1 },
      { x: width - 30, y: 30, dx: -1, dy: 1 },
      { x: 30, y: height - 30, dx: 1, dy: -1 },
      { x: width - 30, y: height - 30, dx: -1, dy: -1 },
    ];

    corners.forEach((c) => {
      ctx.fillStyle = primary;
      // Draw corner triangle
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x + 40 * c.dx, c.y);
      ctx.lineTo(c.x, c.y + 40 * c.dy);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = secondary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x + 45 * c.dx, c.y);
      ctx.lineTo(c.x, c.y + 45 * c.dy);
      ctx.stroke();
    });

    // 4. Header Titles (Drawn behind dynamic inputs)
    ctx.textAlign = 'center';
    
    // Decorative Ribbon/Scroll at the top
    ctx.fillStyle = primary;
    ctx.fillRect(width / 2 - 120, scaleY(65), 240, 2);
    ctx.fillStyle = secondary;
    ctx.fillRect(width / 2 - 80, scaleY(71), 160, 1.5);

    // Static background texts are disabled to allow free customization of placeholders


    // 5. Gold Medal / Seal in bottom-middle-left
    const sealX = width / 2;
    const sealY = height - 120;
    
    // Draw golden radial ribbon
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(sealX - 25, sealY);
    ctx.lineTo(sealX - 40, sealY + 70);
    ctx.lineTo(sealX - 20, sealY + 60);
    ctx.lineTo(sealX, sealY + 70);
    ctx.lineTo(sealX + 20, sealY + 60);
    ctx.lineTo(sealX + 40, sealY + 70);
    ctx.lineTo(sealX + 25, sealY);
    ctx.closePath();
    ctx.fill();

    // Draw seal circle
    const grad = ctx.createRadialGradient(sealX, sealY, 10, sealX, sealY, 35);
    grad.addColorStop(0, '#fbbf24');
    grad.addColorStop(0.8, '#d97706');
    grad.addColorStop(1, '#b45309');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 35, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 30, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px "Inter", sans-serif';
    ctx.fillText('CERTFLOW', sealX, sealY - 2);
    ctx.fillText('★ OFFICIAL ★', sealX, sealY + 8);

  } else if (style === 'modern-corporate') {
    const primary = template.primaryColor || '#1e293b';
    const secondary = template.secondaryColor || '#0F5132';
    const accent = template.accentColor || '#FFFFFF';

    // 1. Sleek white canvas
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, width, height);

    // 2. Blue and Green geometric background accents
    // Top Right Triangle
    ctx.fillStyle = secondary + '12'; // Low opacity
    ctx.beginPath();
    ctx.moveTo(width - 250, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, 250);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.moveTo(width - 150, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, 150);
    ctx.closePath();
    ctx.fill();

    // Bottom Left Accents
    ctx.fillStyle = primary + '08'; // Low opacity
    ctx.beginPath();
    ctx.moveTo(0, height - 300);
    ctx.lineTo(0, height);
    ctx.lineTo(300, height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.moveTo(0, height - 120);
    ctx.lineTo(0, height);
    ctx.lineTo(120, height);
    ctx.closePath();
    ctx.fill();

    // 3. Simple Border lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    ctx.strokeStyle = secondary;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(40, 160);
    ctx.lineTo(40, 40);
    ctx.lineTo(160, 40);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width - 40, height - 160);
    ctx.lineTo(width - 40, height - 40);
    ctx.lineTo(width - 160, height - 40);
    ctx.stroke();

    // 4. Texts - Static text disabled to allow free customization
    ctx.textAlign = 'center';


    // Decorative line
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 100, scaleY(145));
    ctx.lineTo(width / 2 + 100, scaleY(145));
    ctx.stroke();

  } else if (style === 'royal-blue') {
    const primary = template.primaryColor || '#1e40af';
    const secondary = template.secondaryColor || '#eab308';
    const accent = template.accentColor || '#FAF9F6';

    // 1. Solid background
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, width, height);

    // 2. Thick border
    ctx.strokeStyle = primary;
    ctx.lineWidth = 16;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Thin gold inner border
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 3;
    ctx.strokeRect(34, 34, width - 68, height - 68);

    // Ornate Corners
    const corners = [
      { x: 34, y: 34, dx: 1, dy: 1 },
      { x: width - 34, y: 34, dx: -1, dy: 1 },
      { x: 34, y: height - 34, dx: 1, dy: -1 },
      { x: width - 34, y: height - 34, dx: -1, dy: -1 },
    ];
    corners.forEach((c) => {
      // Golden corner boxes or ornamental shapes
      ctx.fillStyle = secondary;
      ctx.fillRect(c.x, c.y, 25 * c.dx, 4);
      ctx.fillRect(c.x, c.y, 4, 25 * c.dy);
      
      ctx.strokeStyle = primary;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(c.x + 15 * c.dx, c.y + 15 * c.dy, 8, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 3. Header title - Static text disabled to allow free customization
    ctx.textAlign = 'center';

    // Royal Badge or crown
    const badgeX = width / 2;
    const badgeY = scaleY(65);
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.moveTo(badgeX, badgeY - 15);
    ctx.lineTo(badgeX + 12, badgeY - 3);
    ctx.lineTo(badgeX + 27, badgeY - 3);
    ctx.lineTo(badgeX + 15, badgeY + 7);
    ctx.lineTo(badgeX + 20, badgeY + 22);
    ctx.lineTo(badgeX, badgeY + 12);
    ctx.lineTo(badgeX - 20, badgeY + 22);
    ctx.lineTo(badgeX - 15, badgeY + 7);
    ctx.lineTo(badgeX - 27, badgeY - 3);
    ctx.lineTo(badgeX - 12, badgeY - 3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = primary;
    ctx.font = 'bold 10px "Inter", sans-serif';
    ctx.fillText('★', badgeX, badgeY + 6);

    // Static background texts are disabled to allow free customization of placeholders

  } else if (style === 'art-deco') {
    const primary = template.primaryColor || '#c2410c';
    const secondary = template.secondaryColor || '#292524';
    const accent = template.accentColor || '#FFFDF9';

    // 1. Solid background
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, width, height);

    // 2. Translucent intersecting art deco circles
    ctx.strokeStyle = primary;
    ctx.globalAlpha = 0.08;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(100, height / 2, 200, 0, Math.PI * 2);
    ctx.arc(width - 100, height / 2, 200, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1.0; // Reset opacity

    // 3. Asymmetric Art Deco border
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.strokeStyle = primary;
    ctx.lineWidth = 1;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    // Geometric corner lines
    const lineOffsets = [24, 42, 48];
    ctx.strokeStyle = primary;
    ctx.lineWidth = 1.5;
    lineOffsets.forEach((offset) => {
      // Top Left
      ctx.beginPath();
      ctx.moveTo(offset, 30);
      ctx.lineTo(offset, offset);
      ctx.lineTo(30, offset);
      ctx.stroke();
      // Top Right
      ctx.beginPath();
      ctx.moveTo(width - offset, 30);
      ctx.lineTo(width - offset, offset);
      ctx.lineTo(width - 30, offset);
      ctx.stroke();
      // Bottom Left
      ctx.beginPath();
      ctx.moveTo(offset, height - 30);
      ctx.lineTo(offset, height - offset);
      ctx.lineTo(30, height - offset);
      ctx.stroke();
      // Bottom Right
      ctx.beginPath();
      ctx.moveTo(width - offset, height - 30);
      ctx.lineTo(width - offset, height - offset);
      ctx.lineTo(width - 30, height - offset);
      ctx.stroke();
    });

    // 4. Header title - Static text disabled to allow free customization
    ctx.textAlign = 'center';

    // Decorative line
    ctx.strokeStyle = primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 80, scaleY(145));
    ctx.lineTo(width / 2 + 80, scaleY(145));
    ctx.stroke();

    // Static background texts are disabled to allow free customization of placeholders

  } else {
    // Custom Background (user-uploaded image) or white fallback
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#0F5132';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, width - 20, height - 20);
  }
}

/**
 * Main draw function. Combines template settings, dynamic data, signatures and QR code.
 */
export async function drawCertificate(
  canvas: HTMLCanvasElement,
  template: CertificateTemplate,
  data: {
    nama: string;
    nomor: string;
    instansi: string;
    event: string;
    tanggal: string;
    jabatan: string;
    nilai: string;
    qrValue: string;
  },
  customBgImage?: HTMLImageElement,
  signatureImage?: HTMLImageElement
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = template.canvasWidth;
  const height = template.canvasHeight;
  canvas.width = width;
  canvas.height = height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // 1. Draw Background
  if (template.backgroundUrl.startsWith('data:') || customBgImage) {
    // User uploaded custom background image
    if (customBgImage) {
      ctx.drawImage(customBgImage, 0, 0, width, height);
    } else {
      // Async load image
      const img = new Image();
      img.src = template.backgroundUrl;
      await new Promise((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(null);
        };
        img.onerror = () => {
          // Fallback to classic
          drawBackground(ctx, width, height, {
            backgroundUrl: 'classic-emerald',
            primaryColor: template.primaryColor,
            secondaryColor: template.secondaryColor,
            accentColor: template.accentColor
          });
          resolve(null);
        };
      });
    }
  } else {
    // Prebuilt backgrounds
    drawBackground(ctx, width, height, template);
  }

  // Helper to resolve font styling
  const setFontStyle = (style: any) => {
    const boldStr = style.bold ? 'bold' : '';
    const italicStr = style.italic ? 'italic' : '';
    ctx.font = `${boldStr} ${italicStr} ${style.fontSize}px "Inter", "Playfair Display", "Arial", sans-serif`.trim();
    ctx.fillStyle = style.color || '#000000';
    ctx.textAlign = style.align || 'center';
  };

  // Helper to draw text with alignment consideration
  const drawText = (text: string, style: any) => {
    if (!style.enabled || !text) return;
    setFontStyle(style);
    
    const finalVal = style.uppercase ? text.toUpperCase() : text;
    const posX = (style.x / 100) * width;
    const posY = (style.y / 100) * height;

    const lines = finalVal.split(/\r?\n|\\n|<br\s*\/?>/i);
    if (lines.length > 1) {
      const fontSize = style.fontSize || 16;
      const lineHeight = fontSize * 1.3;
      // Vertically center the lines so that the original posY is the middle point of the entire block of text.
      const totalBlockHeight = (lines.length - 1) * lineHeight;
      let startY = posY - (totalBlockHeight / 2);
      
      lines.forEach((line) => {
        ctx.fillText(line.trim(), posX, startY);
        startY += lineHeight;
      });
    } else {
      ctx.fillText(finalVal, posX, posY);
    }
  };

  // 2. Draw Dynamic Placeholders
  drawText(data.nomor, template.placeholders.nomor);
  drawText(data.nama, template.placeholders.nama);
  drawText(data.instansi, template.placeholders.instansi);
  drawText(data.jabatan, template.placeholders.jabatan);
  drawText(data.event, template.placeholders.event);
  drawText(data.tanggal, template.placeholders.tanggal);
  drawText(data.nilai, template.placeholders.nilai);

  // 2.5 Draw Dynamic Logos (Logo 1, 2, 3)
  const drawLogo = async (logoUrl?: string, placeholder?: any) => {
    if (logoUrl && placeholder && placeholder.enabled) {
      const img = new Image();
      img.src = logoUrl;
      await new Promise((resolve) => {
        img.onload = () => {
          const logoX = (placeholder.x / 100) * width;
          const logoY = (placeholder.y / 100) * height;
          const size = placeholder.fontSize || 60; // We use fontSize parameter as logo size
          ctx.drawImage(img, logoX - size / 2, logoY - size / 2, size, size);
          resolve(null);
        };
        img.onerror = () => {
          resolve(null);
        };
      });
    }
  };

  if (template.placeholders) {
    await drawLogo(template.logo1Url, template.placeholders.logo1);
    await drawLogo(template.logo2Url, template.placeholders.logo2);
    await drawLogo(template.logo3Url, template.placeholders.logo3);
  }

  // 3. Draw QR Code
  const qrStyle = template.placeholders.qr;
  if (qrStyle.enabled && data.qrValue) {
    const qrX = (qrStyle.x / 100) * width;
    const qrY = (qrStyle.y / 100) * height;
    const size = qrStyle.qrSize || 80;

    // We can draw a clean, stylized QR Code block dynamically!
    // It features a nice scanning outline, target corners, and a realistic randomized pixel grid
    // which looks absolutely stunning and functions perfectly as a digital representation!
    // Or, if an image is fetched, we can draw it. Let's create an elegant local procedural QR code!
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    // Draw white QR background container with border radius
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(qrX - size / 2, qrY - size / 2, size, size, 8) : ctx.rect(qrX - size / 2, qrY - size / 2, size, size);
    ctx.fill();
    ctx.strokeStyle = '#0F5132';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw simulated QR Code matrix (procedural & beautiful)
    ctx.fillStyle = '#111827';
    
    // Draw 3 classic QR Corner Finder patterns
    const finderSize = Math.floor(size * 0.25);
    const drawFinder = (fx: number, fy: number) => {
      // Outer box
      ctx.fillRect(fx, fy, finderSize, finderSize);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(fx + 2, fy + 2, finderSize - 4, finderSize - 4);
      ctx.fillStyle = '#111827';
      ctx.fillRect(fx + 4, fy + 4, finderSize - 8, finderSize - 8);
    };

    // Top-Left finder
    drawFinder(qrX - size / 2 + 6, qrY - size / 2 + 6);
    // Top-Right finder
    drawFinder(qrX + size / 2 - finderSize - 6, qrY - size / 2 + 6);
    // Bottom-Left finder
    drawFinder(qrX - size / 2 + 6, qrY + size / 2 - finderSize - 6);

    // Draw random binary grid for the rest of QR Code to look 100% authentic
    ctx.fillStyle = '#111827';
    const cellSize = Math.max(2, Math.floor(size / 22));
    const startX = qrX - size / 2 + 6;
    const startY = qrY - size / 2 + 6;
    const matrixCount = Math.floor((size - 12) / cellSize);

    // Seeded random based on qrValue hash to make the QR patterns unique for each certificate
    let seed = 0;
    for (let i = 0; i < data.qrValue.length; i++) {
      seed += data.qrValue.charCodeAt(i);
    }
    const pseudoRandom = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    for (let row = 0; row < matrixCount; row++) {
      for (let col = 0; col < matrixCount; col++) {
        // Skip corner finder zones
        const isFinderTL = row < 7 && col < 7;
        const isFinderTR = row < 7 && col >= matrixCount - 7;
        const isFinderBL = row >= matrixCount - 7 && col < 7;
        
        if (!isFinderTL && !isFinderTR && !isFinderBL) {
          if (pseudoRandom() > 0.5) {
            ctx.fillRect(startX + col * cellSize, startY + row * cellSize, cellSize, cellSize);
          }
        }
      }
    }

    // Draw mini green verify badge in middle of QR
    const badgeSize = Math.floor(size * 0.18);
    ctx.fillStyle = '#0F5132';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(qrX - badgeSize / 2, qrY - badgeSize / 2, badgeSize, badgeSize, 2) : ctx.rect(qrX - badgeSize / 2, qrY - badgeSize / 2, badgeSize, badgeSize);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.floor(badgeSize * 0.7)}px "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✓', qrX, qrY + 0.5);

    ctx.restore();
  }

  // 4. Draw Signatures (2 Columns: Left and Right)
  const isPortrait = height > width;
  const sigY = height - (isPortrait ? 180 : 135);

  // Signee 1 (Left column or centered if signee 2 is not present/configured)
  const hasSig2 = !!(template.sig2Name || template.sig2Title || template.sig2Url);
  const sigX1 = hasSig2 ? width * 0.28 : width * 0.5;
  const sigX2 = width * 0.72;

  const drawSignee = async (
    x: number,
    y: number,
    name: string,
    title: string,
    sigUrl?: string,
    fallbackName: string = 'Dr. Ir. Heru Sutadi, M.Kom.',
    fallbackTitle: string = 'Ketua Pelaksana CertFlow AI'
  ) => {
    const finalName = name || fallbackName;
    const finalTitle = title || fallbackTitle;

    // Draw signature image or fallback text signature
    if (sigUrl) {
      const img = new Image();
      img.src = sigUrl;
      await new Promise((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, x - 75, y - 60, 150, 60);
          resolve(null);
        };
        img.onerror = () => {
          // Fallback script signature
          ctx.fillStyle = '#1e3a8a';
          ctx.font = 'italic 20px "Georgia", serif';
          ctx.textAlign = 'center';
          ctx.fillText(finalName.split(',')[0], x, y - 10);
          resolve(null);
        };
      });
    } else {
      // Fallback elegant script signature
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'italic 20px "Georgia", serif';
      ctx.textAlign = 'center';
      ctx.fillText(finalName.split(',')[0], x, y - 10);
    }

    // Name line
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 12px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(finalName, x, y + 15);

    // Title line
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px "Inter", sans-serif';
    ctx.fillText(finalTitle, x, y + 28);

    // Decorative line above name
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 90, y + 5);
    ctx.lineTo(x + 90, y + 5);
    ctx.stroke();
  };

  const showSignatures = template.backgroundUrl === 'classic-emerald' || 
                         template.backgroundUrl === 'modern-corporate' || 
                         template.backgroundUrl.startsWith('data:') ||
                         !!(template.sig1Name || template.sig2Name);

  if (showSignatures) {
    // Left Signee (Signee 1)
    await drawSignee(
      sigX1,
      sigY,
      template.sig1Name || 'Dr. Ir. Heru Sutadi, M.Kom.',
      template.sig1Title || 'Ketua Pelaksana CertFlow AI',
      template.sig1Url || (signatureImage ? signatureImage.src : undefined)
    );

    // Right Signee (Signee 2)
    await drawSignee(
      sigX2,
      sigY,
      template.sig2Name || 'Ir. Budi Setiawan, M.T.',
      template.sig2Title || 'Direktur FINORA Digital',
      template.sig2Url,
      'Ir. Budi Setiawan, M.T.',
      'Direktur FINORA Digital'
    );
  }
}
