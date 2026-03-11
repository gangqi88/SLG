import os
import re

# Define the root directory
ROOT_DIR = r"D:\testProject\SLG\src"

# Define mappings (Old Suffix -> New Alias Path)
# Order matters: more specific first
MAPPINGS = [
    (r"components/Alliance", "@/features/alliance/components"),
    (r"config/alliance", "@/features/alliance/config/alliance"),
    (r"contracts/IAllianceNFT", "@/features/alliance/contracts/IAllianceNFT"),
    (r"game/logic/AllianceManager", "@/features/alliance/logic/AllianceManager"),
    (r"game/logic/MockAllianceService", "@/features/alliance/logic/MockAllianceService"),
    (r"hooks/useAllianceEvents", "@/features/alliance/hooks/useAllianceEvents"),
    (r"hooks/useAlliance", "@/features/alliance/hooks/useAlliance"),
    (r"types/Alliance", "@/features/alliance/types/Alliance"),

    (r"components/MainCity", "@/features/city/components"),
    (r"components/CityView", "@/features/city/components/CityView"),
    (r"game/logic/MainCityManager", "@/features/city/logic/MainCityManager"),
    (r"game/logic/CityManager", "@/features/city/logic/CityManager"),
    (r"game/logic/BuildingManager", "@/features/city/logic/BuildingManager"),
    (r"game/scenes/CityScene", "@/features/city/scenes/CityScene"),
    (r"hooks/useMainCity", "@/features/city/hooks/useMainCity"),
    (r"types/MainCity", "@/features/city/types/MainCity"),
    (r"contracts/ITreasuryContract", "@/features/city/contracts/ITreasuryContract"),

    (r"components/BattleView", "@/features/battle/components/BattleView"),
    (r"components/SiegeView", "@/features/battle/components/SiegeView"),
    (r"components/TowerDefenseView", "@/features/battle/components/TowerDefenseView"),
    (r"game/logic/BattleSystem", "@/features/battle/logic/BattleSystem"),
    (r"game/logic/CombatFormulas", "@/features/battle/logic/CombatFormulas"),
    (r"game/logic/SiegeManager", "@/features/battle/logic/SiegeManager"),
    (r"game/scenes/BattleScene", "@/features/battle/scenes/BattleScene"),
    (r"game/scenes/SiegeBattleScene", "@/features/battle/scenes/SiegeBattleScene"),
    (r"game/scenes/TowerDefenseScene", "@/features/battle/scenes/TowerDefenseScene"),
    (r"game/scenes/SneakAttackScene", "@/features/battle/scenes/SneakAttackScene"),
    (r"game/scenes/DemolitionScene", "@/features/battle/scenes/DemolitionScene"),
    (r"types/BattleTypes", "@/features/battle/types/BattleTypes"),
    
    (r"components/HeroDetail", "@/features/hero/components/HeroDetail"),
    (r"components/HeroDevelopmentView", "@/features/hero/components/HeroDevelopmentView"),
    (r"components/HeroList", "@/features/hero/components/HeroList"),
    (r"data/(\w+Heroes)", r"@/features/hero/data/\1"),
    (r"data/heroes", "@/features/hero/data/heroes"),
    (r"game/logic/HeroLogic", "@/features/hero/logic/HeroLogic"),
    (r"game/logic/BondManager", "@/features/hero/logic/BondManager"),
    (r"game/logic/ComboManager", "@/features/hero/logic/ComboManager"),
    (r"types/Hero", "@/features/hero/types/Hero"),

    (r"components/GachaView", "@/features/gacha/components/GachaView"),
    (r"components/LootBoxView", "@/features/gacha/components/LootBoxView"),
    (r"game/logic/GachaManager", "@/features/gacha/logic/GachaManager"),
    (r"types/LootBox", "@/features/gacha/types/LootBox"),

    (r"components/TaskView", "@/features/task/components/TaskView"),
    (r"game/logic/TaskManager", "@/features/task/logic/TaskManager"),

    (r"components/GatheringView", "@/features/resource/components/GatheringView"),
    (r"components/CookingView", "@/features/resource/components/CookingView"),
    (r"game/logic/ResourceManager", "@/features/resource/logic/ResourceManager"),
    (r"game/logic/InventoryManager", "@/features/resource/logic/InventoryManager"),
    (r"game/scenes/GatheringScene", "@/features/resource/scenes/GatheringScene"),
    (r"game/scenes/CookingScene", "@/features/resource/scenes/CookingScene"),

    (r"components/WalletConnect", "@/shared/components/WalletConnect"),
    (r"game/scenes/PreloadScene", "@/shared/scenes/PreloadScene"),
    (r"game/visuals", "@/shared/visuals"),
    (r"game/web3/NFTManager", "@/shared/web3/NFTManager"),
    (r"game/EventBus", "@/shared/logic/EventBus"),
    (r"utils/web3", "@/shared/utils/web3"),
]

def process_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return

    new_content = content
    
    # Regex to find imports: import ... from "PATH" or import "PATH"
    # Also require("PATH")
    
    def replace_match(match):
        quote = match.group(1)
        path = match.group(2)
        
        # Check if path is relative or matches our patterns
        for pattern, replacement in MAPPINGS:
            # We look for the pattern in the path.
            # If the path contains the pattern (e.g. "../game/logic/AllianceManager"), we replace it.
            
            # Simple substring check doesn't work well with regex replacement groups (like \1)
            # So we use re.search or re.sub
            
            # If pattern has regex groups
            if '\\1' in replacement:
                if re.search(pattern, path):
                     new_path = re.sub(pattern, replacement, path)
                     # Clean up any leading "../" or similar artifacts if the replacement was partial?
                     # No, we want to replace the whole relevant part.
                     # If path is "../../game/logic/HeroLogic", and pattern is "game/logic/HeroLogic",
                     # we want to replace the WHOLE path with "@/features/hero/logic/HeroLogic".
                     # Because we are switching to absolute alias.
                     return f'{quote}{new_path}{quote}'

            elif pattern in path:
                 # If we find the pattern, we assume we want to replace the whole import with the alias
                 # UNLESS it's a very short pattern that might match coincidentally.
                 # Our patterns are quite specific (dirs).
                 
                 # However, we must ensure we are not replacing parts of an already aliased path (unlikely as we just started)
                 if path.startswith("@/"):
                     continue
                     
                 # Replace the whole path with the alias
                 # But wait, if the pattern is "components/Alliance", and path is "components/Alliance/AllianceAd",
                 # result should be "@/features/alliance/components/AllianceAd".
                 
                 new_path = path.replace(pattern, replacement)
                 
                 # Remove any leading "../" or "./" that might have been left over if we just did string replace?
                 # No, string replace "components/Alliance" in "../../components/Alliance/Ad" -> "../../@/features..." which is wrong.
                 
                 # Correct logic:
                 # If path ends with or contains the pattern, we construct the new path.
                 # We want to use the alias.
                 
                 # Let's try to match the pattern at the end of the path (ignoring ../)
                 # Or just find the pattern index.
                 
                 idx = path.find(pattern)
                 if idx != -1:
                     # Keep the part AFTER the pattern
                     suffix = path[idx + len(pattern):]
                     return f'{quote}{replacement}{suffix}{quote}'
        
        return match.group(0)

    # Regex for imports
    # match ' or "
    import_regex = re.compile(r'(from\s+)?(["\'])(.*?)(["\'])')
    
    # This is a bit too broad, matches any string.
    # Better: (import|export)\s+.*?from\s+['"](.*?)['"]
    # And: import\s+['"](.*?)['"]
    
    # Let's iterate line by line to be safer
    lines = new_content.split('\n')
    output_lines = []
    
    for line in lines:
        # Check for import/export ... from ...
        if 'import' in line or 'export' in line or 'require' in line:
            for pattern, replacement in MAPPINGS:
                # Handle regex replacement with groups
                if '\\1' in replacement:
                     # This is for Heroes regex
                     regex_pattern = pattern
                     # We need to see if the line contains a string that matches this pattern
                     # Construct a regex that matches the string content
                     # We assume path is inside quotes
                     
                     # Simple approach: find the string in quotes
                     matches = re.findall(r'[\'"](.*?)[\'"]', line)
                     for m in matches:
                         if re.search(regex_pattern, m):
                             # Apply substitution
                             new_path = re.sub(regex_pattern, replacement, m)
                             # Clean up: if we have "../../@/...", remove the relative part
                             if "@/features" in new_path or "@/shared" in new_path:
                                 # Find where @ starts and keep from there
                                 at_index = new_path.find("@")
                                 final_path = new_path[at_index:]
                                 line = line.replace(m, final_path)
                
                else:
                    # String literal check
                    if pattern in line:
                        # Identify the path part.
                        # We look for the pattern inside the line.
                        # We want to replace the whole path (including relative prefixes) with the alias.
                        
                        # Find the quote char enclosing the pattern
                        # This is tricky without parsing.
                        # But simple string replacement might work if we are careful.
                        
                        # Example: import X from "../../components/Alliance/X"
                        # Pattern: components/Alliance
                        # Replacement: @/features/alliance/components
                        
                        # If I just replace: import X from "../../@/features/alliance/components/X" -> Invalid.
                        
                        # I need to remove the prefix "../../".
                        # So I should find the start of the string.
                        
                        # Regex to find the whole string containing the pattern
                        # (["'])(.*?pattern.*)(["'])
                        
                        p_escaped = re.escape(pattern)
                        line_regex = re.compile(r'([\"\'])(.*?' + p_escaped + r'.*?)([\"\'])')
                        
                        match = line_regex.search(line)
                        if match:
                            full_path = match.group(2)
                            quote = match.group(1)
                            
                            # Replace the pattern in full_path
                            new_path_part = full_path.replace(pattern, replacement)
                            
                            # If the result contains @, take from @ onwards
                            if "@" in new_path_part:
                                idx = new_path_part.find("@")
                                final_path = new_path_part[idx:]
                                
                                # Replace in line
                                line = line.replace(f'{quote}{full_path}{quote}', f'{quote}{final_path}{quote}')

        output_lines.append(line)
    
    new_content = '\n'.join(output_lines)

    if new_content != content:
        print(f"Updating {file_path}")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

for root, dirs, files in os.walk(ROOT_DIR):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            process_file(os.path.join(root, file))
