Add-Type -AssemblyName System.Drawing

function Generate-SiaIcon {
    param(
        [string]$outputPath,
        [int]$size,
        [bool]$isRound = $false
    )

    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.Clear([System.Drawing.Color]::Transparent)

    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    
    # Dominant light blue gradient (#BAE6FD to #38BDF8)
    $c1 = [System.Drawing.Color]::FromArgb(255, 186, 230, 253) # Light Sky Blue #BAE6FD
    $c2 = [System.Drawing.Color]::FromArgb(255, 56, 189, 248)  # Cerulean Light Blue #38BDF8
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 45.0)

    $padding = [int]($size * 0.04)
    $drawSize = $size - ($padding * 2)

    if ($isRound) {
        $g.FillEllipse($brush, $padding, $padding, $drawSize, $drawSize)
    } else {
        $pathObj = New-Object System.Drawing.Drawing2D.GraphicsPath
        $radius = [int]($drawSize * 0.25)
        $d = $radius * 2
        $x = $padding
        $y = $padding
        $r = $padding + $drawSize
        $b = $padding + $drawSize

        $pathObj.AddArc($x, $y, $d, $d, 180, 90)
        $pathObj.AddArc($r - $d, $y, $d, $d, 270, 90)
        $pathObj.AddArc($r - $d, $b - $d, $d, $d, 0, 90)
        $pathObj.AddArc($x, $b - $d, $d, $d, 90, 90)
        $pathObj.CloseFigure()
        $g.FillPath($brush, $pathObj)
    }

    # Draw bold text "SIA"
    $fontSize = [float]($size * 0.38)
    $fontFamily = New-Object System.Drawing.FontFamily("Arial")
    $font = New-Object System.Drawing.Font($fontFamily, $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

    # Text shadow / subtle depth
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 2, 132, 199))
    $shadowRect = New-Object System.Drawing.RectangleF(0, [float]($size * 0.02), [float]$size, [float]$size)
    $g.DrawString("SIA", $font, $shadowBrush, $shadowRect, $sf)

    # Main text in white
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $textRect = New-Object System.Drawing.RectangleF(0, 0, [float]$size, [float]$size)
    $g.DrawString("SIA", $font, $textBrush, $textRect, $sf)

    $dir = [System.IO.Path]::GetDirectoryName($outputPath)
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    $format = [System.Drawing.Imaging.ImageFormat]::Png
    $bmp.Save($outputPath, $format)
    $g.Dispose()
    $bmp.Dispose()
}

function Generate-BackgroundIcon {
    param([string]$outputPath, [int]$size)
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $c1 = [System.Drawing.Color]::FromArgb(255, 234, 246, 255)
    $c2 = [System.Drawing.Color]::FromArgb(255, 186, 230, 253)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 45.0)
    $g.FillRectangle($brush, $rect)
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

function Generate-ForegroundIcon {
    param([string]$outputPath, [int]$size)
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.Clear([System.Drawing.Color]::Transparent)

    $fontSize = [float]($size * 0.28)
    $fontFamily = New-Object System.Drawing.FontFamily("Arial")
    $font = New-Object System.Drawing.Font($fontFamily, $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

    # Cerulean light blue SIA text
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 2, 132, 199))
    $textRect = New-Object System.Drawing.RectangleF(0, 0, [float]$size, [float]$size)
    $g.DrawString("SIA", $font, $textBrush, $textRect, $sf)

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

# Assets folder
Generate-SiaIcon -outputPath "D:\SiAbsen\assets\icon.png" -size 1024 -isRound $false
Generate-ForegroundIcon -outputPath "D:\SiAbsen\assets\android-icon-foreground.png" -size 512
Generate-BackgroundIcon -outputPath "D:\SiAbsen\assets\android-icon-background.png" -size 512
Generate-ForegroundIcon -outputPath "D:\SiAbsen\assets\android-icon-monochrome.png" -size 512
Generate-SiaIcon -outputPath "D:\SiAbsen\assets\splash-icon.png" -size 256 -isRound $false
Generate-SiaIcon -outputPath "D:\SiAbsen\assets\favicon.png" -size 64 -isRound $false

# Android Splashscreens
$splashDrawables = @("drawable-hdpi", "drawable-mdpi", "drawable-xhdpi", "drawable-xxhdpi", "drawable-xxxhdpi")
$splashSizes = @(192, 128, 256, 384, 512)
for ($i = 0; $i -lt $splashDrawables.Length; $i++) {
    $folder = $splashDrawables[$i]
    $s = $splashSizes[$i]
    Generate-SiaIcon -outputPath "D:\SiAbsen\android\app\src\main\res\$folder\splashscreen_logo.png" -size $s -isRound $false
}

# Android Mipmap Icons
$mipmaps = @("mipmap-mdpi", "mipmap-hdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi")
$iconSizes = @(48, 72, 96, 144, 192)
for ($i = 0; $i -lt $mipmaps.Length; $i++) {
    $m = $mipmaps[$i]
    $s = $iconSizes[$i]
    Generate-SiaIcon -outputPath "D:\SiAbsen\android\app\src\main\res\$m\ic_launcher.png" -size $s -isRound $false
    Generate-SiaIcon -outputPath "D:\SiAbsen\android\app\src\main\res\$m\ic_launcher_round.png" -size $s -isRound $true
    Generate-ForegroundIcon -outputPath "D:\SiAbsen\android\app\src\main\res\$m\ic_launcher_foreground.png" -size $s
    Generate-BackgroundIcon -outputPath "D:\SiAbsen\android\app\src\main\res\$m\ic_launcher_background.png" -size $s
    Generate-ForegroundIcon -outputPath "D:\SiAbsen\android\app\src\main\res\$m\ic_launcher_monochrome.png" -size $s
}
Write-Host "All SIA icons created successfully!"
